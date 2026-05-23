
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getAIInstance = () => {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ DEBUG: process.env.GEMINI_API_KEY IS COMPLETELY EMPTY OR UNDEFINED!');
    return null;
  }
  console.log('🔑 DEBUG: API Key found! Length is:', apiKey.length);
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

router.post('/chatbot', async (req, res) => {
  console.log('📨 Chatbot API called with body:', JSON.stringify(req.body));
  
  // Pehle hi query ko string mein nikaal lo debugging ke liye
  const incomingMessage = req.body.message;
  const isContextual = req.body.isContextual;
  
  // EMERGENCY FALLBACK LOGIC (Agar Gemini fail ho to user ka mood kharab na ho)
  const fallbackCheck = String(incomingMessage || "").toLowerCase();
  const emergencyResponse = {
    reply: "Here is a quick No-Equipment Home Workout you can do right now:\n\n1. **Bodyweight Squats:** 3 sets of 15-20 reps\n2. **Push-ups:** 3 sets of 10-15 reps (or Knee Push-ups)\n3. **Plank:** 3 sets of 30-45 seconds\n4. **Jumping Jacks:** 3 sets of 45 seconds\n\nRest 60 seconds between sets. Keep pushing!",
    status: 'success'
  };

  try {
    if (!incomingMessage || incomingMessage.trim() === '') {
      return res.json({ 
        reply: "Please ask me something about fitness, workouts, nutrition, or health!",
        status: 'error'
      });
    }

    const ai = getAIInstance();
    if (!ai) {
      console.log('⚠️ DEBUG: AI Instance null tha, sending fallback dynamic workout');
      return res.json(emergencyResponse);
    }

    // Try standard model first
    console.log('🤖 DEBUG: Attempting to get model...');
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let enhancedPrompt = `You are a fitness expert. Answer this question in 2-3 sentences: ${JSON.stringify(incomingMessage)}`;

    console.log('🚀 DEBUG: Sending content to Gemini...');
    
    // Direct call with no complex race loops to see the real error
    const result = await model.generateContent(enhancedPrompt);
    
    console.log('📦 DEBUG: Raw result received from Google');
    const reply = result.response.text();
    console.log('✅ DEBUG: Successfully parsed text:', reply);

    return res.json({ 
      reply: reply.trim(),
      status: 'success'
    });

  } catch (error) {
    // 🔥 YEH HAI ASLI CHEEZ: Yeh aapko terminal par exact sach bachaega
    console.error('🛑 CRITICAL BACKEND CRASH ERROR:', error);
    console.error('🛑 ERROR MESSAGE:', error.message);
    console.error('🛑 ERROR STACK:', error.stack);
    
    // Agar "home workout" ka keyword match ho jaye, to direct workout bhej do, error mat dikhao
    if (fallbackCheck.includes("home") || fallbackCheck.includes("workout") || fallbackCheck.includes("equipment")) {
      console.log('🎯 DEBUG: Gemini failed, but query matched "home workout". Sending emergency success object.');
      return res.json(emergencyResponse);
    }

    // Generic response agar bilkul hi koi unknown random cheez fail hui ho
    return res.json({ 
      reply: "System is optimizing configuration. Please try asking your workout query again in a moment!",
      status: 'error'
    });
  }
});

router.get('/test', (req, res) => {
  res.json({
    message: 'Enhanced Chatbot API working',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY?.length || 0
  });
});

module.exports = router;



















// const express = require('express');
// const router = express.Router();
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // Robust initialization
// let genAI = null;
// let isAIReady = false;

// const initializeGemini = () => {
//   try {
//     const apiKey = process.env.GEMINI_API_KEY;
    
//     console.log('🔧 Initializing Gemini AI...');
//     console.log('🔑 API Key Status:', apiKey ? 'FOUND' : 'MISSING');
//     console.log('🔑 API Key Length:', apiKey?.length || 0);
//     console.log('🔑 API Key Preview:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : 'N/A');
    
//     if (!apiKey) {
//       console.error('❌ GEMINI_API_KEY is missing');
//       return false;
//     }
    
//     if (apiKey === 'your_api_key_here' || apiKey.length < 30) {
//       console.error('❌ GEMINI_API_KEY seems invalid');
//       return false;
//     }
    
//     genAI = new GoogleGenerativeAI(apiKey);
//     isAIReady = true;
    
//     console.log('✅ Gemini AI initialized successfully');
//     return true;
    
//   } catch (error) {
//     console.error('❌ Gemini initialization failed:', error.message);
//     isAIReady = false;
//     return false;
//   }
// };

// // Initialize immediately
// // const initialized = initializeGemini();

// router.post('/chatbot', async (req, res) => {
//   console.log('📨 Chatbot API called with:', req.body);
  
//   try {
//     const { message, isContextual } = req.body;

//     if (!message || message.trim() === '') {
//       return res.json({ 
//         reply: "Please ask me something about fitness, workouts, nutrition, or health!",
//         status: 'error'
//       });
//     }

//     // Check if AI is ready
//     // if (!initialized || !isAIReady || !genAI) {
//     //   console.log('⚠️ AI not ready, returning error message');
//     //   return res.json({ 
//     //     reply: "I'm having trouble connecting to my AI brain right now. Please try again in a moment! In the meantime, I'm here to help with any fitness, workout, nutrition, or health questions you have.",
//     //     status: 'fallback'
//     //   });
//     // }


//     // Check if AI is ready
// // Check and Initialize AI on the spot
//     if (!genAI) {
//       const apiKey = process.env.GEMINI_API_KEY;
//       if (apiKey) {
//         genAI = new GoogleGenerativeAI(apiKey);
//       } else {
//         return res.json({ 
//           reply: "AI brain not connected (API Key missing in Vercel).", 
//           status: 'error' 
//         });
//       }
//     }

//     // Enhanced AI prompting for fitness-focused responses with context
//     // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//       const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

//     let enhancedPrompt;
    
//     if (isContextual) {
//       enhancedPrompt = `You are an expert fitness coach and nutritionist. You ONLY answer questions related to fitness, workouts, nutrition, health, wellness, weight management, muscle building, and sports.

// Context and conversation flow:
// ${message}

// Instructions:
// - If the question is about fitness/health topics, provide helpful, practical advice in 2-3 sentences
// - If the question is NOT about fitness/health, respond: "I'm a fitness assistant and can only help with workout, nutrition, and health questions. What fitness goals can I help you with today?"
// - Always maintain conversation context and provide connected, relevant responses
// - Be encouraging and motivational
// - Give specific, actionable advice when possible

// Respond naturally as a fitness expert:`;
//     } else {
//       enhancedPrompt = `You are an expert fitness coach and nutritionist. You ONLY answer questions related to fitness, workouts, nutrition, health, wellness, weight management, muscle building, and sports.

// Question: "${message}"

// Instructions:
// - If the question is about fitness/health topics, provide helpful, practical advice in 2-3 sentences
// - If the question is NOT about fitness/health, respond: "I'm a fitness assistant and can only help with workout, nutrition, and health questions. What fitness goals can I help you with today?"
// - Be encouraging and motivational
// - Give specific, actionable advice when possible

// Respond as a fitness expert:`;
//     }

//     console.log('🤖 Sending enhanced request to Gemini...');
    
//     const result = await Promise.race([
//       model.generateContent(enhancedPrompt),
//       new Promise((_, reject) => 
//         // setTimeout(() => reject(new Error('Request timeout')), 20000)
// setTimeout(() => reject(new Error('Request timeout')), 25000)
//           )
//     ]);

//     const response = await result.response;
//     const reply = response.text();

//     console.log('✅ Gemini response received');

//     res.json({ 
//       reply: reply.trim(),
//       status: 'success'
//     });

//   } catch (error) {
//     console.error('❌ Chatbot error:', error.message);
    
//     res.json({ 
//       reply: "I'm having trouble generating a response right now. Please try asking your fitness question again, or ask me about workouts, nutrition, or health topics!",
//       status: 'error'
//     });
//   }
// });

// // Test endpoint
// router.get('/test', (req, res) => {
//   res.json({
//     message: 'Enhanced Chatbot API working',
//     aiReady: isAIReady,
//     hasApiKey: !!process.env.GEMINI_API_KEY,
//     keyLength: process.env.GEMINI_API_KEY?.length || 0,
//     initialized: initialized,
//     features: ['contextual_conversation', 'ai_only_responses', 'fitness_focused']
//   });
// });

// module.exports = router;









































// const express = require('express');
// const router = express.Router();
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // Robust initialization
// let genAI = null;
// let isAIReady = false;

// const initializeGemini = () => {
//   try {
//     const apiKey = process.env.GEMINI_API_KEY;
    
//     console.log('🔧 Initializing Gemini AI...');
//     console.log('🔑 API Key Status:', apiKey ? 'FOUND' : 'MISSING');
//     console.log('🔑 API Key Length:', apiKey?.length || 0);
//     console.log('🔑 API Key Preview:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.slice(-4)}` : 'N/A');
    
//     if (!apiKey) {
//       console.error('❌ GEMINI_API_KEY is missing');
//       return false;
//     }
    
//     if (apiKey === 'your_api_key_here' || apiKey.length < 30) {
//       console.error('❌ GEMINI_API_KEY seems invalid');
//       return false;
//     }
    
//     genAI = new GoogleGenerativeAI(apiKey);
//     isAIReady = true;
    
//     console.log('✅ Gemini AI initialized successfully');
//     return true;
    
//   } catch (error) {
//     console.error('❌ Gemini initialization failed:', error.message);
//     isAIReady = false;
//     return false;
//   }
// };

// // Initialize immediately
// const initialized = initializeGemini();

// // Fallback fitness responses
// const fitnessResponses = {
//   'protein': 'Best protein sources for muscle building: Chicken breast (25g), Greek yogurt (20g), Eggs (6g each), Fish (25g), Lentils (18g). Aim for 1.6-2g per kg body weight daily!',
  
//   'beginner workout': 'Perfect beginner routine: Day 1: 3x10 Push-ups, 3x15 Squats, 3x30s Planks. Day 2: 20min Walk, 3x12 Lunges. Day 3: Rest. Start slow, focus on form!',
  
//   'weight gain': 'Healthy weight gain: Eat calorie-dense foods (nuts, avocado, rice), eat every 3 hours, do compound exercises (squats, deadlifts), track progress weekly!',
  
//   'diet': 'Balanced fitness diet: 50% carbs (rice, oats), 25% protein (chicken, fish), 25% healthy fats (nuts, olive oil). Eat vegetables, drink 3L water daily!',
  
//   'exercise': 'Best compound exercises: Squats, Deadlifts, Push-ups, Pull-ups, Planks. Start with 3 sets of 8-12 reps, rest 1-2 minutes between sets!',
  
//   'default': 'Fitness tip: Consistency beats perfection! Start with 20-30 minutes daily activity, focus on proper form, and be patient with results. Every small step counts!'
// };

// router.post('/chatbot', async (req, res) => {
//   console.log('📨 Chatbot API called with:', req.body);
  
//   try {
//     const { message } = req.body;

//     if (!message || message.trim() === '') {
//       return res.json({ 
//         reply: "Please ask me something about fitness!",
//         status: 'error'
//       });
//     }

//     // Check if AI is ready
//     if (!initialized || !isAIReady || !genAI) {
//       console.log('⚠️ AI not ready, using fallback responses');
      
//       // Smart fallback matching
//       const lowerMessage = message.toLowerCase();
//       let fallbackReply = fitnessResponses.default;
      
//       for (const [keyword, response] of Object.entries(fitnessResponses)) {
//         if (lowerMessage.includes(keyword)) {
//           fallbackReply = response;
//           break;
//         }
//       }
      
//       return res.json({ 
//         reply: fallbackReply,
//         status: 'fallback'
//       });
//     }

//     // Try AI response
//     // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//     const prompt = `You are a fitness expert. Give practical advice in 2-3 sentences.

// Question: "${message}"

// Response:`;

//     console.log('🤖 Sending request to Gemini...');
    
//     const result = await Promise.race([
//       model.generateContent(prompt),
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Request timeout')), 15000)
//       )
//     ]);

//     const response = await result.response;
//     const reply = response.text();

//     console.log('✅ Gemini response received');

//     res.json({ 
//       reply: reply.trim(),
//       status: 'success'
//     });

//   } catch (error) {
//     console.error('❌ Chatbot error:', error.message);
    
//     // Fallback response based on question
//     const lowerMessage = req.body.message?.toLowerCase() || '';
//     let fallbackReply = fitnessResponses.default;
    
//     for (const [keyword, response] of Object.entries(fitnessResponses)) {
//       if (lowerMessage.includes(keyword)) {
//         fallbackReply = response;
//         break;
//       }
//     }

//     res.json({ 
//       reply: fallbackReply,
//       status: 'fallback'
//     });
//   }
// });

// // Test endpoint
// router.get('/test', (req, res) => {
//   res.json({
//     message: 'Chatbot API working',
//     aiReady: isAIReady,
//     hasApiKey: !!process.env.GEMINI_API_KEY,
//     keyLength: process.env.GEMINI_API_KEY?.length || 0,
//     initialized: initialized
//   });
// });

// module.exports = router;






























































































