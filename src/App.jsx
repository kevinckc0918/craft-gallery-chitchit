import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, X, Image as ImageIcon, LogOut, Lock, Palette, Sparkles, Filter } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyAGAwFt4Fxlf9oYdOhr4IuPCCZbGx3ImF4",
  authDomain: "craft-gallery-chitchit.firebaseapp.com",
  projectId: "craft-gallery-chitchit",
  storageBucket: "craft-gallery-chitchit.firebasestorage.app",
  messagingSenderId: "991248469692",
  appId: "1:991248469692:web:fab6432b827f1900e94ab9",
  measurementId: "G-B61TEGE0JL"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "craft-gallery-chitchit";

// --- Constants ---
const CATEGORIES = ['花藝', '麵粉花', '水晶花', '法式刺繡', '蜀繡', '水彩', '油畫'];
const ADMIN_PASSWORD = 'chitchit0504';

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    price: '',
    imageUrl: ''
  });

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Authentication Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const craftsRef = collection(db, 'artifacts', appId, 'public', 'data', 'crafts');
    
    setLoading(true);
    const unsubscribe = onSnapshot(craftsRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedItems.sort((a, b) => b.createdAt - a.createdAt);
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('密碼錯誤，請重新輸入');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const openForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        category: item.category,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        category: CATEGORIES[0],
        description: '',
        price: '',
        imageUrl: ''
      });
    }
    setShowFormModal(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!user) return;

    const craftsRef = collection(db, 'artifacts', appId, 'public', 'data', 'crafts');
    const dataToSave = {
      ...formData,
      price: Number(formData.price) || 0,
      updatedAt: Date.now()
    };

    try {
      if (editingId) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'crafts', editingId);
        await updateDoc(docRef, dataToSave);
      } else {
        dataToSave.createdAt = Date.now();
        await addDoc(craftsRef, dataToSave);
      }
      setShowFormModal(false);
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("儲存失敗，請稍後再試。");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這個作品嗎？無法復原。')) return;
    if (!user) return;

    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'crafts', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // --- Render Helpers ---
  const filteredItems = selectedCategory === '全部' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFFBF7] font-sans text-stone-800 selection:bg-rose-200 relative">
      
      {/* 藝術感背景光影 (Watercolor Blobs) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-200/40 blur-[80px] mix-blend-multiply opacity-80 animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-amber-200/40 blur-[80px] mix-blend-multiply opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-teal-100/50 blur-[80px] mix-blend-multiply opacity-60" style={{animationDuration: '10s'}}></div>
      </div>

      {/* Header - Glassmorphism */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-wider text-stone-800 ml-1">拾藝空間</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <button 
                  onClick={() => openForm()}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md shadow-rose-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">新增作品</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-white/80 border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-full transition-colors text-sm shadow-sm"
                  title="登出管理員"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1 text-stone-400 hover:text-rose-500 transition-colors text-sm p-2"
                title="管理員登入"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6 relative">
          <Sparkles className="w-8 h-8 text-rose-300 absolute -top-6 left-[15%] md:left-[30%] animate-pulse" />
          <Sparkles className="w-6 h-6 text-orange-300 absolute top-10 right-[15%] md:right-[30%] animate-pulse" style={{animationDelay: '1s'}} />
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-stone-800 tracking-wide drop-shadow-sm">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
              手作工藝品
            </span>
            {' '}展覽館
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed text-lg">
            每一件作品都是獨一無二的心血結晶。在這裡探索色彩、材質與美學的交織。
          </p>
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('全部')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              selectedCategory === '全部'
                ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-200 border-none'
                : 'bg-white/80 backdrop-blur-sm text-stone-500 hover:bg-white border border-rose-100 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-200 border-none'
                  : 'bg-white/80 backdrop-blur-sm text-stone-500 hover:bg-white border border-rose-100 hover:border-rose-300 hover:text-rose-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-400"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-stone-400 py-24 flex flex-col items-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
               <Filter className="w-10 h-10 text-rose-200" />
            </div>
            <p className="text-lg font-medium text-stone-600">這個分類目前還沒有作品</p>
            {isAdmin && <p className="text-sm mt-2 text-rose-400">點擊右上角「新增作品」來建立第一個展品吧！</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white shadow-[0_8px_30px_rgb(220,180,180,0.15)] hover:shadow-[0_20px_40px_rgb(220,180,180,0.3)] transition-all duration-500 group flex flex-col hover:-translate-y-2">
                
                {/* Image Container */}
                <div className="relative aspect-w-4 aspect-h-3 w-full h-72 bg-rose-50/50 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { e.target.src = 'https://placehold.co/600x400/FFF0F0/D4A373?text=Art+Piece' }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-200">
                      <ImageIcon className="w-16 h-16 mb-3 opacity-60" />
                      <span className="text-sm font-medium tracking-wide">尚無圖片</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-rose-500 shadow-sm border border-rose-50">
                    {item.category}
                  </div>

                  {/* Admin Actions Overlay */}
                  {isAdmin && (
                    <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openForm(item)}
                        className="bg-white/95 backdrop-blur text-blue-500 p-2.5 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
                        title="編輯"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="bg-white/95 backdrop-blur text-rose-500 p-2.5 rounded-full shadow-lg hover:bg-rose-50 transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Card Content */}
                <div className="p-7 flex flex-col flex-grow bg-gradient-to-b from-transparent to-white/50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-serif font-bold text-stone-800 line-clamp-1" title={item.title}>
                      {item.title}
                    </h3>
                    {item.price > 0 && (
                      <span className="font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg text-sm whitespace-nowrap ml-3 border border-rose-100">
                        HK$ {item.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 flex-grow">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 border border-white">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 bg-stone-50 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 rotate-3 border border-rose-100">
                <Lock className="w-6 h-6 text-rose-400 -rotate-3" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-800">館長登入</h3>
              <p className="text-sm text-stone-500 mt-2">請輸入通行密碼以管理作品</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="輸入密碼 (預設為 admin)"
                  className="w-full px-5 py-3.5 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all bg-stone-50/50"
                  autoFocus
                />
                {loginError && <p className="text-rose-500 text-sm mt-2 px-1 font-medium">{loginError}</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white font-medium py-3.5 rounded-xl transition-all shadow-md shadow-rose-200"
              >
                解鎖管理權限
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Item Form Modal (Add / Edit) */}
      {showFormModal && isAdmin && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] w-full max-w-2xl my-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-white">
            
            <div className="px-8 py-6 border-b border-rose-100/50 flex items-center justify-between flex-shrink-0 bg-white/50 rounded-t-[2rem]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                  <Palette className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-800">
                  {editingId ? '編輯展品資訊' : '新增展品'}
                </h3>
              </div>
              <button 
                onClick={() => setShowFormModal(false)}
                className="text-stone-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="craft-form" onSubmit={handleSaveForm} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-stone-700">作品名稱 *</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50/50 focus:bg-white transition-all"
                      placeholder="例如: 晨曦玫瑰"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-stone-700">藝術分類 *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50/50 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">圖片網址 (URL)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50/50 focus:bg-white transition-all"
                    placeholder="https://example.com/image.jpg (留空則顯示預設底圖)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">價格 (HK$)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-5 py-3 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50/50 focus:bg-white transition-all"
                    placeholder="例如: 350 (非賣品可留空或填 0)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-stone-700">作品簡述 *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-stone-50/50 focus:bg-white transition-all resize-none leading-relaxed"
                    placeholder="描述一下這個作品的材質、靈感或是尺寸，讓觀賞者更能體會其中的心意..."
                  />
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-rose-100/50 bg-stone-50/50 flex justify-end gap-4 rounded-b-[2rem] flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-200/50 transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                form="craft-form"
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-orange-400 text-white hover:from-rose-600 hover:to-orange-500 transition-all shadow-md shadow-rose-200"
              >
                儲存展品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
