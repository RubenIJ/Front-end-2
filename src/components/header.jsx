import { useSession } from '../hooks/useSession';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import '../Style.css';

function Header() {
    const { session } = useSession();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!session) return;

        const fetchProfile = async () => {
            const { data: { session: authSession } } = await supabase.auth.getSession();
            if (!authSession) return;

            const { data } = await supabase
                .from('Profiles')
                .select('avatar_url, Username')
                .eq('user_id', authSession.user.id)
                .maybeSingle();

            if (data) setProfile(data);
        };

        fetchProfile();
    }, [session]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <header>
            <h1>BookNed</h1>
            {session && (
                <div className="header-nav">
                    <a href="/home">Home</a>
                    <a href="/profile">Profiel</a>

                    <div className="home-userlink">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="avatar"
                                className="home-avatar"
                            />
                        ) : (
                            <div className="home-avatar-placeholder">
                                {session.email?.[0].toUpperCase()}
                            </div>
                        )}
                        <span>{profile?.Username ?? session.email}</span>
                    </div>

                    <button className="btn-ghost" onClick={handleLogout}>Uitloggen</button>
                </div>
            )}
        </header>
    );
}

export default Header;