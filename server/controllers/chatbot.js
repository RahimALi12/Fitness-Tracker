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
//     if (!initialized || !isAIReady || !genAI) {
//       console.log('⚠️ AI not ready, returning error message');
//       return res.json({ 
//         reply: "I'm having trouble connecting to my AI brain right now. Please try again in a moment! In the meantime, I'm here to help with any fitness, workout, nutrition, or health questions you have.",
//         status: 'fallback'
//       });
//     }

//     // Enhanced AI prompting for fitness-focused responses with context
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
//         setTimeout(() => reject(new Error('Request timeout')), 20000)
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





















const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

// Robust initialization
let groq = null;
let isAIReady = false;

const initializeGroq = () => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    console.log('🔧 Initializing Groq AI...');
    console.log('🔑 API Key Status:', apiKey ? 'FOUND' : 'MISSING');
    
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY is missing in .env');
      return false;
    }
    
    // Initialize Groq SDK
    groq = new Groq({ apiKey: apiKey });
    isAIReady = true;
    
    console.log('✅ Groq AI initialized successfully (Ultra Fast Mode)');
    return true;
    
  } catch (error) {
    console.error('❌ Groq initialization failed:', error.message);
    isAIReady = false;
    return false;
  }
};

// Initialize immediately
const initialized = initializeGroq();

router.post('/chatbot', async (req, res) => {
  console.log('📨 Chatbot API called with:', req.body);
  
  try {
    const { message, isContextual } = req.body;

    if (!message || message.trim() === '') {
      return res.json({ 
        reply: "Please ask me something about fitness, workouts, nutrition, or health!",
        status: 'error'
      });
    }

    // Check if AI is ready - Safe Fallback
    if (!initialized || !isAIReady || !groq) {
      console.log('⚠️ Groq AI not ready, returning fallback message');
      return res.json({ 
        reply: "I am currently updating my fitness database. To calculate your daily protein, a general rule is 1.6 to 2.2 grams per kilogram of body weight depending on your training intensity. Let me know your fitness goals!",
        status: 'fallback'
      });
    }

    // System prompt setting up the fitness persona
    const systemPrompt = `You are an expert fitness coach and nutritionist. You ONLY answer questions related to fitness, workouts, nutrition, health, wellness, weight management, muscle building, and sports.
Instructions:
- If the question is about fitness/health topics, provide helpful, practical advice in 2-3 sentences.
- If the question is NOT about fitness/health, respond: "I'm a fitness assistant and can only help with workout, nutrition, and health questions. What fitness goals can I help you with today?"
- Always maintain conversation context if provided and give connected, relevant responses.
- Be encouraging, motivational, and give specific, actionable advice.`;

    let userContent = message;
    if (isContextual) {
      userContent = `Here is the conversation history and current question:\n${message}`;
    }

    console.log('🤖 Sending request to Groq (Llama-3)...');
    
    let reply = "";
    try {
      // Using Llama3 8B model which is extremely fast and smart
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        model: 'llama-3.1-8b-instant', // Super fast aur active model
        temperature: 0.7,
        max_tokens: 300,
      });

      reply = chatCompletion.choices[0]?.message?.content || "";
    } catch (apiErr) {
      console.error('⚠️ Groq API Call Error:', apiErr.message);
      
      // Smart fallback logic
      if (message.toLowerCase().includes('protein')) {
        reply = "For active individuals and muscle building, you generally need about 1.6 to 2.2 grams of protein per kilogram of body weight daily. Try splitting it across 4-5 meals for optimal absorption!";
      } else {
        reply = "I'm experiencing a quick connection blip. For a quick tip: focus on progressive overload in your workouts and consistency in your meals!";
      }
    }

    console.log('✅ Response generated safely from Groq');

    return res.json({ 
      reply: reply.trim(),
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Chatbot global catch error:', error.message);
    return res.json({ 
      reply: "I'm having a little trouble processing that structure right now. Please try asking your fitness question again!",
      status: 'error'
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Groq Chatbot API working',
    aiReady: isAIReady,
    hasApiKey: !!process.env.GROQ_API_KEY,
    initialized: initialized,
    modelUsed: 'llama3-8b-8192',
    features: ['contextual_conversation', 'ultra_fast_speed', 'fitness_focused']
  });
});

module.exports = router;
