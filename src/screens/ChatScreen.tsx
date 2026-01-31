import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseAI } from '../services/ai/inference';
import { useSettingsStore } from '../store/settingsStore';
import { getMessages, addMessage, deleteExpense, updateExpense } from '../database/db';
import { Cpu, Sparkles, CheckCircle, Send, RotateCcw, Edit2, X } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import CategoryPicker from '../components/CategoryPicker';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type: 'text' | 'transaction' | 'error' | 'message';
  data?: any;
}

export const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currency } = useSettingsStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { sendMessage, result, isProcessing, modelReady, downloadProgress } = useExpenseAI();
  const flatListRef = useRef<FlatList>(null);
  
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getMessages();
      if (history.length > 0) {
        // Map DB messages to UI messages if needed, but they should match
        setMessages(history);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      } else {
        // Add initial greeting
        const initMsg: Message = {
          id: 'init',
          text: `Hi! I'm your financial assistant. Tell me what you spent (e.g., 'Spent ${currency.symbol}15 on lunch') or ask about your expenses.`,
          sender: 'ai',
          type: 'text'
        };
        setMessages([initMsg]);
      }
    };
    loadHistory();
  }, []);

  // Handle AI results
  useEffect(() => {
    if (!result) return;

    let aiText = result.content;
    if (result.type === 'transaction' && result.data) {
      const { merchant, category, amount } = result.data;
      const cleanMerchant = merchant && merchant.toLowerCase() !== 'unknown' ? merchant : null;
      
      if (cleanMerchant) {
         aiText = `Saved: ${cleanMerchant} - ${currency.symbol}${amount} (${category})`;
      } else {
         aiText = `Saved: ${currency.symbol}${amount} for ${category}`;
      }

      if (result.data.budget) {
        const { remaining, limit } = result.data.budget;
        aiText += `\nRemaining budget for ${category}: ${currency.symbol}${remaining.toFixed(2)}`;
      }
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
    addMessage(aiMsg);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
  }, [result]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user', type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    addMessage(userMsg);
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

  const handleUndo = async (transactionId: number) => {
    try {
      await deleteExpense(transactionId);
      // Update the message in the list to reflect undo
      setMessages(prev => prev.map(msg => {
        if (msg.type === 'transaction' && msg.data?.id === transactionId) {
          return {
            ...msg,
            text: `Transaction undone.`,
            type: 'text', // Convert to text so actions disappear
            data: undefined
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error("Failed to undo transaction", error);
    }
  };

  const handleChangeCategory = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setShowCategoryPicker(true);
  };

  const handleCategorySelect = async (category: string) => {
    if (selectedTransactionId) {
      try {
        await updateExpense(selectedTransactionId, { category });
        // Update UI
        setMessages(prev => prev.map(msg => {
            if (msg.type === 'transaction' && msg.data?.id === selectedTransactionId) {
                const newData = { ...msg.data, category };
                // Re-construct text - simplified
                return {
                    ...msg,
                    text: msg.text.replace(/\(.*\)/, `(${category})`).replace(/for .*/, `for ${category}`) + `\n(Category updated to ${category})`,
                    data: newData
                };
            }
            return msg;
        }));
      } catch (error) {
        console.error("Failed to update category", error);
      }
    }
    setShowCategoryPicker(false);
    setSelectedTransactionId(null);
  };

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
          {item.type === 'transaction' && item.data?.id && (
             <View>
               <View style={styles.transactionCard}>
                  <CheckCircle size={20} color={colors.primary} />
                  <Text style={[styles.transactionText, { color: colors.text }]}>Transaction Logged</Text>
               </View>
               <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]} onPress={() => handleUndo(item.data.id)}>
                      <RotateCcw size={14} color={colors.textSecondary} />
                      <Text style={[styles.actionText, { color: colors.textSecondary }]}>Undo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: colors.border }]} onPress={() => handleChangeCategory(item.data.id)}>
                      <Edit2 size={14} color={colors.textSecondary} />
                      <Text style={[styles.actionText, { color: colors.textSecondary }]}>Category</Text>
                  </TouchableOpacity>
               </View>
             </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
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
                    <Send size={22} color="white" />
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <CategoryPicker 
                    selectedCategory="" 
                    onSelectCategory={handleCategorySelect} 
                />
            </View>
        </View>
      </Modal>
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
    flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'center' 
  },
  input: { flex: 1, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 17, maxHeight: 120 },
  sendButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  transactionCard: { flexDirection: 'row', alignItems: 'center', marginTop: 8, opacity: 0.9 },
  transactionText: { marginLeft: 4, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1 },
  actionText: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 200 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' }
});
