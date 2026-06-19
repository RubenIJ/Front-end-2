import { supabase } from '../supabase';

const toggleLike = async (postId, posts, session, fetchPosts) => {
    const heeftGeliket = posts
        .find(p => p.id === postId)
        .likes.some(like => like.user_id === session.sub);

    if (heeftGeliket) {
        await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', session.sub);
    } else {
        await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: session.sub });
    }

    fetchPosts();
};

export default toggleLike;