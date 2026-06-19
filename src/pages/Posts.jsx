import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import toggleLike from '../components/toggleLike';

function Posts() {
    const { session } = useSession();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);

    // Posts ophalen
    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, Profiles(Username, avatar_url), likes(*)');

        if (error) console.error('Fetch error:', error);
        setPosts(data || []);
    };

    // Bij laden meteen posts ophalen
    useEffect(() => {
        fetchPosts();
    }, []);

    // Post plaatsen
    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageUrl = null;

        // image uploaden
        if (image) {
            const fileName = `${session.sub}-${Date.now()}`;
            const { error: uploadError } = await supabase.storage
                .from('posts')
                .upload(fileName, image);

            if (uploadError) {
                console.error(uploadError);
                return;
            }

            // publieke URL ophalen
            const { data } = supabase.storage
                .from('posts')
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
        }

        const { error } = await supabase.from('posts').insert({
            user_id: session.sub,
            content: content,
            image: imageUrl,
        });

        if (error) console.error('Insert error:', error);

        if (!error) {
            setContent('');
            setImage(null);
            fetchPosts();
        }
    };

    // Post verwijderen
    const handleDelete = async (id) => {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (!error) fetchPosts();
    };

    return (
        <div>
            {/* Formulier */}
            <form className="posts-form" onSubmit={handleSubmit}>
                <textarea
                    rows="5"
                    placeholder="Schrijf een post..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <div className="posts-form-actions">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    <button className="btn-primary" type="submit">Posten</button>
                </div>
            </form>

            {/* Posts tonen */}
            {posts.map((post) => (
                <div className="post-card" key={post.id}>
                    <span className="post-author">{post.Profiles?.Username}</span>
                    <p className="post-content">{post.content}</p>
                    {post.image && (
                        <img className="post-image" src={post.image} alt="post afbeelding" />
                    )}
                    <div className="post-actions">
                        {/* Like knop */}
                        <button
                            className={`btn-like ${post.likes.some(like => like.user_id === session.sub) ? 'liked' : ''}`}
                            onClick={() => toggleLike(post.id, posts, session, fetchPosts)}
                        >
                            {post.likes.some(like => like.user_id === session.sub) ? '❤️' : '🤍'}
                            {post.likes.length}
                        </button>
                        {/* Verwijder knop */}
                        {post.user_id === session?.sub && (
                            <button className="btn-danger" onClick={() => handleDelete(post.id)}>
                                Verwijderen
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Posts;