import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseAI } from '../services/ai/inference';
import { Cpu, Sparkles, CheckCircle, Send } from 'lucide-react-native';
import { Colors } from '../constants/colors';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'transaction' | 'error' | 'message';
  data?: any;
}

export const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { sendMessage, result, isProcessing, modelReady, downloadProgress } = useExpenseAI();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Add initial greeting
    setMessages([{
      id: 'init',
      text: "Hi! I'm your financial assistant. Tell me what you spent (e.g., 'Spent $15 on lunch') or ask about your expenses.",
      sender: 'ai',
      type: 'text'
    }]);
  }, []);

  // Handle AI results
  useEffect(() => {
    if (!result) return;

    let aiText = result.content;
    if (result.type === 'transaction' && result.data) {
      aiText = `Saved: ${result.data.merchant || 'Expense'} - $${result.data.amount} (${result.data.category})`;
    } else if (!aiText && result.type !== 'error') {
      aiText = "I processed that but have nothing to say.";
    }

    const aiMsg: Message = {
      id: Date.now().toString(),
      text: aiText || 'Error processing request',
      sender: 'ai',
      type: result.type,
      data: result.data
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  }, [result]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await sendMessage(userText);
  };


  if (!modelReady) {
    if (downloadProgress > 0 && downloadProgress < 1) {
       return (
        <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Downloading Model...</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{Math.round(downloadProgress * 100)}%</Text>
        </SafeAreaView>
       );
    }

     return (
        <SafeAreaView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
            <Cpu size={64} color={colors.text} />
            <Text style={[styles.title, { color: colors.text }]}>AI Model Loading...</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Initializing Llama 3.2 model (~1GB). Please wait.</Text>
            {/* The model loads automatically via useLLM hook */}
        </SafeAreaView>
     )
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Sparkles size={16} color="#FFFFFF" />
          </View>
        )}
        <View style={[
          styles.bubble, 
          isUser ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border }
        ]}>
          <Text style={[styles.messageText, isUser ? { color: '#FFFFFF' } : { color: colors.text }]}>{item.text}</Text>
          {item.type === 'transaction' && (
             <View style={styles.transactionCard}>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.transactionText}>Transaction Logged</Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} disabled={isProcessing} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
                {isProcessing ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <Send size={20} color="white" />
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 
  },
  listContent: { padding: 16 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bubble: { padding: 12, borderRadius: 20, maxWidth: '80%' },
  messageText: { fontSize: 16 },
  inputContainer: { 
    flexDirection: 'row', padding: 10, borderTopWidth: 1, alignItems: 'center' 
  },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 16, maxHeight: 100 },
  sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  transactionCard: { flexDirection: 'row', alignItems: 'center', marginTop: 8, opacity: 0.9 },
  transactionText: { color: 'white', marginLeft: 4, fontWeight: '600' }
});
