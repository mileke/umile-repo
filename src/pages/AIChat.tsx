import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createChat, generateSpeech, playSpeech } from '../services/aiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Bot, User as UserIcon, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AIChat() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const [sessionLang, setSessionLang] = useState<string>('');

  useEffect(() => {
    if (userProfile && userProfile.languagePreference !== sessionLang) {
      if (recognitionRef.current) {
         const langMap: any = { 'English': 'en-US', 'Sheng': 'sw-KE', 'Swahili': 'sw-KE' };
         recognitionRef.current.lang = langMap[userProfile.languagePreference] || 'en-US';
      }

      createChat(userProfile).then(session => setChatSession(session));
      setSessionLang(userProfile.languagePreference);
      
      setMessages(prev => {
        if (prev.length === 0) {
          return [{
            id: 'welcome',
            role: 'model',
            text: `Hello! I am your Umile Tutor, Otieno. I will speak to you in **${userProfile.languagePreference}**. What topic would you like to explore today?`
          }];
        } else {
          return [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: `*(System): Language switched to ${userProfile.languagePreference}*`
          }];
        }
      });
    }
  }, [userProfile?.languagePreference]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported in this browser.");
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = async (text: string) => {
     if (!voiceEnabled || !text) return;
     try {
       const base64Audio = await generateSpeech(text);
       if (base64Audio) {
         await playSpeech(base64Audio);
       }
     } catch (e) {
       console.error("TTS error:", e);
     }
  }

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const responseStream = await chatSession.sendMessageStream({ message: userMessage.text });
      
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);
      
      let fullResponse = "";
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        fullResponse += c.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex].text = fullResponse;
          return newMessages;
        });
      }
      
      if (voiceEnabled) {
        speakText(fullResponse);
      }
      
    } catch (error) {
       console.error("AI Error:", error);
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Oops! I had a little trouble thinking about that. Could we try again?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pt-2 w-full max-w-5xl mx-auto">
      <header className="mb-6 shrink-0 flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-foreground">AI Tutor Session</h2>
           <p className="text-muted-foreground mt-1">Chatting with Otieno in {userProfile?.languagePreference}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setVoiceEnabled(!voiceEnabled)} className="rounded-full shadow-sm">
           {voiceEnabled ? <Volume2 size={16} className="mr-2" /> : <VolumeX size={16} className="mr-2" />}
           {voiceEnabled ? 'Voice On' : 'Voice Off'}
        </Button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col rounded-3xl border border-border shadow-sm relative bg-card">
        <ScrollArea className="flex-1 p-6 relative h-full">
          <div className="flex flex-col space-y-6 pb-24">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                 <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground pt-1'}`}>
                   {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={18} />}
                 </div>
                 <div className={`p-4 rounded-[20px] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-[4px]' : 'bg-muted/50 border border-border/50 text-foreground rounded-tl-[4px]'}`}>
                    <div className="markdown-body prose-sm max-w-none dark:prose-invert">
                       <Markdown>{msg.text}</Markdown>
                    </div>
                    {msg.role === 'model' && msg.id !== 'welcome' && !isTyping && (
                       <button onClick={() => speakText(msg.text)} className="mt-2 text-muted-foreground hover:text-foreground inline-flex items-center text-xs ml-1 cursor-pointer outline-none border-none bg-transparent">
                          <Volume2 size={12} className="mr-1" /> Replay Voice
                       </button>
                    )}
                 </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 max-w-[80%] self-start">
                 <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                   <Bot size={18} />
                 </div>
                 <div className="p-4 rounded-[20px] bg-muted/50 border border-border/50 rounded-tl-[4px] flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/90 to-transparent pt-10">
          <div className="relative w-full max-w-4xl mx-auto flex gap-2">
            <Button onClick={toggleListening} variant={isListening ? 'destructive' : 'secondary'} size="icon" className="shrink-0 rounded-full h-12 w-12 shadow-sm">
               {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Input 
              placeholder="Ask Otieno anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="rounded-full bg-background border-border/60 py-6 px-6 text-base"
              disabled={isTyping}
            />
            <Button onClick={handleSend} disabled={isTyping || !input.trim()} size="icon" className="shrink-0 rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-sm">
               <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
