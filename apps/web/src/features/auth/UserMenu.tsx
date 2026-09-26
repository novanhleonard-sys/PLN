import { Link } from 'react-router-dom';
import { useAuth } from './AuthStore';
import { Icon } from '../../ui/basic/Icon';

export const UserMenu = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link 
        to="/masuk" 
        className="w-12 h-12 rounded-full shadow-md bg-teal hover:bg-teal-dark transition-all flex items-center justify-center text-white"
        title="Masuk"
      >
        <Icon name="LogIn" size={20} />
      </Link>
    );
  }

  const avatar = user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + user.id;

  return (
    <div className="relative group pb-2">
      <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:ring-2 hover:ring-teal transition-all bg-white relative z-10 block">
        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-[-10px] group-hover:translate-y-0 z-50">
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden flex flex-col font-nunito">
          <Link to="/profil" className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-teal font-bold transition-colors">
            Profil
          </Link>
          <Link to="/kontribusi" className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-teal font-bold transition-colors border-t border-stone-100">
            Kontribusi
          </Link>
          <Link to="/profil/preferensi" className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-teal font-bold transition-colors border-t border-stone-100">
            Pengaturan
          </Link>
        </div>
      </div>
    </div>
  );
};
