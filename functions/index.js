// Firebase
const { onRequest } = require("firebase-functions/v2/https");

// Cors
const cors = require('cors');
const logger = require("firebase-functions/logger");

// Sendgrid
const sgMail = require('@sendgrid/mail');

// Mixpanel
const Mixpanel = require('mixpanel');

// Dotenv
require('dotenv').config();

// LLM Models
const OpenAI = require("openai");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { Anthropic } = require("@anthropic-ai/sdk");
const { Together } = require("together-ai");
const { CohereClient } = require('cohere-ai');

// Supabase
const { createClient } = require('@supabase/supabase-js');
const supabaseClient = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY);

// Stripe
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);

// Sendgrid
const emailTemplates = {
  NewInvitationEmail: "d-2b28b347865f44da8e17fad96bbb36ff",
  WelcomeEmail: "d-0752ffa59ab3486db935fd71c87d2694",
};

// Allowed origins
const allowedOrigins = ['https://voicebridge-app.web.app', 'https://app.voicebridgeai.com']; // , 'http://localhost:3000'

// Cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,POST',
  credentials: true,
};

// Cors middleware
const corsMiddleware = cors(corsOptions);

/*
  API: Generate document embeddings
  Request: 
    texts: Array of texts
  Response:
    json response
*/

exports.generateDocumentEmbeddings = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {
    
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {

      if (req.body && req.body.texts) {
        let texts = req.body.texts;

        try {

          // Prepare texts
          let prepared_texts = texts.map((t) => t.content);

          // Initialize embeddings array
          let embeddings = [];

          // Call Together API in batches of 100
          for (let i = 0; i < prepared_texts.length; i += 100) {

            const url = 'https://api.together.xyz/v1/embeddings';
            const options = {
              method: 'POST',
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Bearer ' + process.env.REACT_APP_TOGETHER_API_KEY
              },
              body: JSON.stringify({ 
                model: 'WhereIsAI/UAE-Large-V1',
                input: prepared_texts.slice(i, i + 100)
              })
            };

            const responseEmbeddings = await fetch(url, options);
            const jsonEmbeddings = await responseEmbeddings.json();

            if (jsonEmbeddings && jsonEmbeddings.data && jsonEmbeddings.data.length > 0) {
              embeddings = embeddings.concat(jsonEmbeddings.data);
            } else {
              res.status(400).send(JSON.stringify({ error: "Embeddings failed" }));
            }

          }

          // Send response
          if (embeddings.length > 0) {
            res.status(200).send(JSON.stringify(embeddings));
          } else {
            res.status(400).send(JSON.stringify({ error: "Embeddings failed" }));
          }

        } catch(error) {
          // Error
          res.status(400).send(JSON.stringify({ error: "Embeddings failed" }));
        }
      } else {
        // Missing parameters
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      // Unauthorized access 
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  });

});

/*
  API: Generate query embedding
  Request: 
    query: Query string
  Response:
    json response
*/

exports.generateQueryEmbedding = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {
    
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {

      if (req.body && req.body.query) {
        let query = req.body.query;

        try {

          // Call Together API
          const url = 'https://api.together.xyz/v1/embeddings';
          const options = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authorization: 'Bearer ' + process.env.REACT_APP_TOGETHER_API_KEY
            },
            body: JSON.stringify({ 
              model: 'WhereIsAI/UAE-Large-V1',
              input: query
            })
          };

          const responseEmbedding = await fetch(url, options);
          const jsonEmbedding = await responseEmbedding.json();

          if (jsonEmbedding && jsonEmbedding.data && jsonEmbedding.data.length > 0) {
            res.status(200).send(JSON.stringify(jsonEmbedding.data));
          } else {
            res.status(400).send(JSON.stringify({ error: "Embedding failed" }));
          }

        } catch(error) {
          // Error
          res.status(400).send(JSON.stringify({ error: "Embeddings failed" }));
        }
      } else {
        // Missing parameters
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      // Unauthorized access 
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  });
  
});

/*
  API: Call generative AI streaming chat completion for OpenAI
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    res write or end
*/

exports.callStreamingChatCompletionOpenAI = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {

      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;

        try {
          // Format messages
          let formatted_messages = messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
            return { role: m.role, content: m.content.trim() };
          });
          // Instantiate model
          const openai = new OpenAI({
            apiKey: process.env.REACT_APP_OPENAI_KEY,
          });
          // Begin streaming
          const stream = await openai.chat.completions.create({
            model: model.variant,
            messages: formatted_messages,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: true,
            stream_options: { include_usage: true }
          });
          // Look through chunks
          for await (const chunk of stream) {
            // Record usage
            if (chunk.usage) {
              recordTokenUsage(userId, model, chunk.usage && chunk.usage.prompt_tokens ? chunk.usage.prompt_tokens : 0, chunk.usage && chunk.usage.completion_tokens ? chunk.usage.completion_tokens : 0, chunk.usage && chunk.usage.total_tokens ? chunk.usage.total_tokens : 0);
            } else {
              if (chunk.choices[0]?.finish_reason) {
                res.end();
              } else {
                if (chunk.choices[0]?.delta?.content) {
                  res.write(chunk.choices[0].delta.content);
                }
              }
            }
          }
        } catch(error) {
          // End streaming - Error
          res.end();
        }
      } else {
        // End streaming - Missing parameters
        res.end();
      }
    } else {
      // End streaming - Unauthorized access 
      res.end();
    }
  })
});


/*
  API: Call generative AI chat completion for OpenAI
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    json response
*/

exports.callChatCompletionOpenAI = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;
        // let schema = req.body.schema;

        const openai = new OpenAI({
          apiKey: process.env.REACT_APP_OPENAI_KEY,
        });

        let prepared_messages_array = messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
          return { role: m.role, content: m.content.trim() };
        })

        try {
          // Call OpenAI
          const response = await openai.chat.completions.create({
            model: model.variant,
            messages: prepared_messages_array,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0,
            response_format: { type: "json_object" }, // , schema: schema
          });

          if (response) {
            
            recordTokenUsage(userId, model, response.usage && response.usage.prompt_tokens ? response.usage.prompt_tokens : 0, response.usage && response.usage.completion_tokens ? response.usage.completion_tokens : 0, response.usage && response.usage.total_tokens ? response.usage.total_tokens : 0);

            if (response.choices && response.choices.length > 0 && response.choices[0].message && response.choices[0].message.content) {
              res.status(200).send(JSON.stringify(response.choices[0].message.content));
            } else {
              res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
            }

          } else {
            res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
          }

        } catch (error) {
          res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
        }

      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});


/*
  API: Call generative AI streaming chat completion for Google
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    res write or end
*/

exports.callStreamingChatCompletionGoogle = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {

      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;
        
        // Prepare system instructions and formatted messages
        let systemInstruction = "";
        let formatted_messages = [];
        messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
          if (m.role === 'system') {
            systemInstruction = m.content;
          } else {
            formatted_messages.push({ role: m.role === 'assistant' ? 'model' : m.role, parts: [{ text: m.content.trim() }] })
          }
        });

        if (formatted_messages.length > 0) {

          try {

            // Instantiate model
            const googleAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_AI_STUDIO_API_KEY);
            const googleModel = googleAI.getGenerativeModel({
              model: model.variant,
              systemInstruction: systemInstruction,
              safetySettings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 50,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
            });

            // Call stream generator
            const result = await googleModel.generateContentStream({
              contents: formatted_messages,
            });

            // Loop through all chunks
            let promptTokenCount = 0;
            let candidatesTokenCount = 0;
            let totalTokenCount = 0;
            for await (const chunk of result.stream) {
              promptTokenCount = chunk?.usageMetadata?.promptTokenCount ? parseInt(chunk.usageMetadata.promptTokenCount) : 0;
              candidatesTokenCount = chunk?.usageMetadata?.candidatesTokenCount ? parseInt(chunk.usageMetadata.candidatesTokenCount) : 0;
              totalTokenCount = chunk?.usageMetadata?.totalTokenCount ? parseInt(chunk.usageMetadata.totalTokenCount) : 0;
              const chunkText = chunk.text();
              res.write(chunkText);
            }
            // Record token usage
            recordTokenUsage(userId, model, promptTokenCount, candidatesTokenCount, totalTokenCount);
            // End streaming
            res.end();
          } catch (error) {
            // End streaming - Error
            res.end();
          }
        } else {
          // End streaming - Missing parameters
          res.end();
        }
      } else {
        // End streaming - Missing parameters
        res.end();
      }
    } else {
      // End streaming - Unauthorized access 
      res.end();
    }
  })
});

/*
  API: Call generative AI chat completion for Google Gemini
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    json response
*/

exports.callChatCompletionGoogle = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;

        const googleAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_AI_STUDIO_API_KEY);
        let systemInstruction = "";

        let prepared_messages_array = [];
        messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
          if (m.role === 'system') {
            systemInstruction = m.content;
          } else {
            prepared_messages_array.push({ role: m.role === 'assistant' ? 'model' : m.role, parts: [{ text: m.content.trim() }] })
          }
        });

        // extract last message in array as prompt
        let prompt = prepared_messages_array[prepared_messages_array.length - 1];
        prepared_messages_array.splice(-1);

        if (prompt && prompt.role === 'user' && prompt.parts.length > 0) {

          const generationConfig = {
            temperature: 0.7,
            topK: 0,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          };
      
          const safetySettings = [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ];
      
          try {
      
            const googleModel = googleAI.getGenerativeModel({
              model: model.variant,
              systemInstruction: systemInstruction,
            });
      
            const chat = googleModel.startChat({
              generationConfig,
              safetySettings,
              history: prepared_messages_array,
            });
      
            const result = await chat.sendMessage(prompt.parts);

            if (result) {
              
              recordTokenUsage(userId, model, result.response.usageMetadata && result.response.usageMetadata.promptTokenCount ? result.response.usageMetadata.promptTokenCount : 0, result.response.usageMetadata && result.response.usageMetadata.candidatesTokenCount ? result.response.usageMetadata.candidatesTokenCount : 0, result.response.usageMetadata && result.response.usageMetadata.totalTokenCount ? result.response.usageMetadata.totalTokenCount : 0);
              
              res.status(200).send(JSON.stringify(result.response.text()));
            
            } else {
              res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
            }
      
          } catch (error) {
            res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
          }
      
        } else {
          res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
        }
      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});

/*
  API: Call generative AI streaming chat completion for Anthropic
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    res write or end
*/

exports.callStreamingChatCompletionAnthropic = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;
      
        try {

          // Format messages
          let formatted_messages = [];
          messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
            if (m.role === 'system') {
              system_instruction = m.content;
            } else {
              formatted_messages.push({ "role": m.role, "content": [{ "type": 'text', "text": m.content.trim() }] })
            }
          });
      
          // Call Anthropic
          const anthropic = new Anthropic({
            apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
          });

          await anthropic.messages.stream({
            model: model.variant,
            max_tokens: 2600,
            temperature: 0.7,
            system: system_instruction,
            messages: formatted_messages
          }).on('text', (text) => {
            res.write(text);
          }).on('message', (message) => {
            let input_tokens = message.usage && message.usage.input_tokens ? message.usage.input_tokens : 0;
            let output_tokens = message.usage && message.usage.output_tokens ? message.usage.output_tokens : 0;
            recordTokenUsage(userId, model, input_tokens, output_tokens, parseInt(input_tokens) + parseInt(output_tokens));
          }).on('end', (e) => {
            res.end();
          });
        } catch (error) {
          // End streaming - Error
          res.end();
        }
      } else {
        // End streaming - Missing parameters
        res.end();
      }
    } else {
      // End streaming - Unauthorized access 
      res.end();
    }
  })
});

/*
  API: Call generative AI chat completion from Anthropic
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    error: true or false
    msg: page content docs
*/

exports.callChatCompletionAnthropic = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;

        const anthropic = new Anthropic({
          apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
        });

        let system_instruction = "";
        let prepared_messages_array = [];
        messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
          if (m.role === 'system') {
            system_instruction = m.content;
          } else {
            prepared_messages_array.push({ "role": m.role, "content": [{ "type": 'text', "text": m.content.trim() }] })
          }
        });

        try {
          // Call Anthropic
          const response = await anthropic.messages.create({
            model: model.variant,
            max_tokens: 2600,
            temperature: 0.7,
            system: system_instruction,
            messages: prepared_messages_array
          });

          if (response) {
            let input_tokens = response.usage && response.usage.input_tokens ? response.usage.input_tokens : 0;
            let output_tokens = response.usage && response.usage.output_tokens ? response.usage.output_tokens : 0;
            
            recordTokenUsage(userId, model, input_tokens, output_tokens, parseInt(input_tokens) + parseInt(output_tokens));
            
            if (response.content && response.content.length > 0 && response.content[0].text) {
              res.status(200).send(JSON.stringify(response.content[0].text));
            } else {
              res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
            }
          
          } else {
            res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
          }
          
          // Return entire response object
          return response;
      
        } catch (error) {
          res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
        }
        
      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});


/*
  API: Call generative AI streaming chat completion for Fireworks
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    res write or end
*/

exports.callStreamingChatCompletionFireworks = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;
        
        try {
          // Format messages
          let formatted_messages = messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
            return { "content": m.content.trim(), "role": m.role };
          });
          const bearer = "Bearer " + process.env.REACT_APP_FIREWORKS_API_KEY;
          const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              "Content-Type": 'application/json',
              Authorization: bearer,
            },
            body: JSON.stringify({
              model: model.variant,
              max_tokens: 2048,
              temperature: 0.7,
              top_p: 0.95,
              top_k: 50,
              presence_penalty: 0,
              frequency_penalty: 0,
              messages: formatted_messages,
              stream: true,
              stop: null,
              response_format: { type: 'text' },
            }),
          });

          const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader()

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Do something with last chunk of data then exit reader
              res.end();
              break;
            }
            // console.log('value', value);
            let jsonString = value.replace(/^data: /,'')
            let parsedJson = JSON.parse(jsonString);
            // console.log('parsedJson', parsedJson);
            if (parsedJson?.choices[0]?.delta?.content) {
              res.write(parsedJson.choices[0].delta.content);
            }
          }
        } catch(error) {
          res.end();
        }
      } else {
        // End streaming - Missing parameters
        res.end();
      }
    } else {
      // End streaming - Unauthorized access 
      res.end();
    }
  })
});

/*
  API: Call generative AI streaming chat completion for Together
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    res write or end
*/

exports.callStreamingChatCompletionTogether = onRequest((req, res) => {

  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;

        try {
          // Format messages
          let formatted_messages = messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
            return { "content": m.content.trim(), "role": m.role };
          });
          const together = new Together({ apiKey: process.env.REACT_APP_TOGETHER_API_KEY });
          const stream = await together.chat.completions.create({
              messages: formatted_messages,
              model: model.variant,
              max_tokens: 4096,
              temperature: 0.7,
              top_p: 0.95,
              top_k: 50,
              repetition_penalty: 1,
              // stream_tokens: true,
              stream: true,
              stop: ["<|eot_id|>"],
              negative_prompt: ""
          });
          for await (const chunk of stream) {
              // console.log('Chunk: ');
              if (chunk.usage) {
                recordTokenUsage(userId, model, chunk.usage && chunk.usage.prompt_tokens ? chunk.usage.prompt_tokens : 0, chunk.usage && chunk.usage.completion_tokens ? chunk.usage.completion_tokens : 0, chunk.usage && chunk.usage.total_tokens ? chunk.usage.total_tokens : 0);
              }
              if (chunk?.choices[0]?.delta?.content) {
                res.write(chunk.choices[0].delta.content);
              }
          }
          res.end();
        } catch(error) {
          res.end();
        }
      } else {
        // End streaming - Missing parameters
        res.end();
      }
    } else {
      // End streaming - Unauthorized access 
      res.end();
    }
  })
});


/*
  API: Call generative AI chat completion for Together
  Request: 
    model: Model name
    messages: Chat messages
    user uid
    schema
  Response:
    error: true or false
    msg: page content docs
*/

exports.callChatCompletionTogether = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.model && req.body.messages && req.body.user_id) {
        let model = req.body.model;
        let messages = req.body.messages;
        let userId = req.body.user_id;
        // let schema = req.body.schema;

        let prepared_messages_array = messages.sort((a, b) => (a.ts > b.ts) ? 1 : -1).map((m) => {
          return { "content": m.content.trim(), "role": m.role };
        });

        try {

          // Call Together
          const bearer = "Bearer " + process.env.REACT_APP_TOGETHER_API_KEY;
          const response = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              "Content-Type": 'application/json',
              Authorization: bearer,
            },
            body: JSON.stringify({
              "model": model.variant,
              "max_tokens": 2048,
              "temperature": 0.7,
              "top_p": 0.5,
              "top_k": 50,
              "repetition_penalty": 1,
              "messages": prepared_messages_array,
              "response_format": { "type": 'json_object' }, // , "schema": schema
            }),
          });
      
          let responseJson = await response.json();

          if (responseJson) {
            recordTokenUsage(userId, model, responseJson.usage && responseJson.usage.prompt_tokens ? responseJson.usage.prompt_tokens : 0, responseJson.usage && responseJson.usage.completion_tokens ? responseJson.usage.completion_tokens : 0, responseJson.usage && responseJson.usage.total_tokens ? responseJson.usage.total_tokens : 0);
            console.log('responding with', response);
            res.status(200).send(JSON.stringify(response));
          } else {
            res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
          }

        } catch (error) {
          console.log('error', error);
          res.status(400).send(JSON.stringify({ error: "Chat completion failed" }));
        }

      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});


/*
  Function: Record token usage
  Parameters:
    user_id
    model
    promptTokens
    completionTokens
    totalTokens
  Return:
    null
*/

async function recordTokenUsage(user_id, model, prompt_tokens, completion_tokens, total_tokens) {

  const { data, error } = await supabaseClient
    .from('usage')
    .insert([{
      created_by: user_id,
      prompt_tokens: prompt_tokens,
      completion_tokens: completion_tokens,
      total_tokens: total_tokens,
      model_id: model.id,
    }])

  if (error) {
    return false;
  } else {
    return true;
  }

}

/*
  Function: Stripe API: Create customer
  Parameters:
    customer_email
    user_id
  Return:
    null
*/

exports.stripeCreateCustomer = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.customer_email) {

        let customerEmail = req.body.customer_email;
        let userId = req.body.user_id;

        stripe.customers.create({
          email: customerEmail,
          metadata: {
            user_id: userId
          }
        }).then((customer) => {
          if (customer) {
            res.status(200).send(customer);
          } else {
            res.status(400).send(JSON.stringify({ error: "Stripe error" }));
          }
        }).catch((error) => {
          res.status(400).send(JSON.stringify({ error: "Stripe error" }));
        })

      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});

/*
  Function: Stripe API: Create checkout session
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

exports.stripeCreateCheckoutSession = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.price_id && req.body.stripe_customer_id) {
        let priceId = req.body.price_id;
        let customerId = req.body.stripe_customer_id;

        stripe.checkout.sessions.create({
          mode: "subscription",
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          success_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/canceled`,
          customer: customerId,
        }).then((session) => {
          res.status(200).send({ url: session.url });
        }).catch((error) => {
          return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
        })

      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});


/*
  Function: Stripe API: Create customer billing portal
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

exports.stripeCreateCustomerPortalSession = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.stripe_customer_id) {
        let customerId = req.body.stripe_customer_id;
        stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${process.env.REACT_APP_STRIPE_PORTAL_URL}`,
        }).then((session) => {
          res.status(200).send({ url: session.url });
        }).catch((error) => {
          return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
        })
      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});

/*
  Function: Stripe API: Get subscription status
  Parameters:
    subscription_id: Stripe subscription id
  Return:
    subscription object
*/

exports.stripeGetSubscription = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.subscription_id) {
        let subscriptionId = req.body.subscription_id;
        stripe.subscriptions.retrieve(
          subscriptionId
        ).then((subscription) => {
          res.status(200).send({ subscription: subscription });
        }).catch((error) => {
          return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
        })
      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});


/*
  Function: Stripe Webhooks
  Parameters:
  Return:
*/

exports.stripeWebhooks = onRequest(
  { cors: true },
  (req, res) => {
    let event = req.body;

    const endpointSecret = process.env.REACT_APP_STRIPE_ENDPOINT_SECRET;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = req.headers['stripe-signature'];
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
      }
    }
    let subscription;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        console.log('customer.subscription.trial_will_end', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        console.log('customer.subscription.deleted', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        console.log('customer.subscription.created', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        console.log('customer.subscription.updated', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'customer.subscription.paused':
        subscription = event.data.object;
        console.log('customer.subscription.paused', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'customer.subscription.resumed':
        subscription = event.data.object;
        console.log('customer.subscription.resumed', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      case 'entitlements.active_entitlement_summary.updated':
        subscription = event.data.object;
        console.log('entitlements.active_entitlement_summary.updated', subscription.status);
        if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
          stripeUpdateUser(subscription);
        }
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
);


/*
  Function: Update user with Stripe details
  Parameters:
    customer_id
    plan_id
    status
  Return:
    null
*/

async function stripeUpdateUser(subscription) {

  const { data, error } = await supabaseClient
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_plan_id: subscription.plan.id,
      stripe_status: subscription.status,
      stripe_current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start*1000) : null,
      stripe_current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end*1000) : null,
    })
    .eq('stripe_customer_id', subscription.customer)

  // console.log('user stripe update error', data, error);

  if (error) {
    return false;
  } else {
    return true
  }

}

/*
  Function: Sendgrid API: Send welcome email
  Parameters:
    email
    to_name
  Return:
    null
*/

exports.sendgridWelcomeEmail = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.email && req.body.to_name) {

        let email = req.body.email;
        let to_name = req.body.to_name;

        sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);
        sgMail.send({
          to: email,
          replyTo: "hello@terastack.ai",
          from: "Terastack <hello@terastack.ai>",
          templateId: emailTemplates["WelcomeEmail"],
          dynamic_template_data: {
            to_name: to_name,
          }
        })

      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});

/*
  Function: MixPanel Track Event
  Parameters:
    user_id
    event_name
    event
  Return:
    200 or 400
*/

exports.mixpanelTrackEvent = onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
      if (req.body && req.body.user_id && req.body.event_name && req.body.event) {

        let user_id = req.body.user_id;
        let event_name = req.body.event_name;
        let event_object = req.body.event;

        try {
          
          // Create an instance of the mixpanel client
          const mixpanel = Mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);

          // Track event
          mixpanel.track(event_name, event_object);
          
          // Increment document created
          if (event_name === 'Document Created') {
            mixpanel.people.increment(user_id, 'documents_created');
          }
          
          // Increment file created
          if (event_name === 'File Created') {
            mixpanel.people.increment(user_id, 'files_created');
          }

          res.status(200).send();

        } catch(err) {
          res.status(400).send(JSON.stringify({ error: "Mixpanel error" }));
        }
      } else {
        res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
      }
    } else {
      res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
    }
  })
});



