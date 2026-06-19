import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";
import { useParams } from "react-router";

export default function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        async function fetchPublicProfile() {
            const { data } = await supabase
                .from('Profiles')
                .select('*')
                .eq('user_id', id)
                .single();

            if (data) setProfile(data);
        }

        fetchPublicProfile();
    }, [id]);

    if (!profile) return <p>Profiel laden...</p>;

    return (
        <div className="profile-wrapper">
            <div className="profile-card">
                <div className="profile-header">
                    {profile.avatar_url
                        ? <img className="profile-avatar" src={profile.avatar_url} alt="avatar" />
                        : <div className="profile-avatar-placeholder">{profile.Username?.[0]?.toUpperCase() ?? '?'}</div>
                    }
                    <div className="profile-info">
                        <h2>{profile.Username ?? '—'}</h2>
                        <span className="profile-badge">{profile.is_private ? 'Privé' : 'Openbaar'}</span>
                    </div>
                </div>
                <p className="profile-bio">{profile.Bio || 'Geen bio ingesteld.'}</p>
            </div>
        </div>
    );
}