import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { fetchPosts } from '../../api/postService';
import CreatePostForm from './CreatePostForm';
import Post from './post';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndSetPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const postsFromServer = await fetchPosts();
      setPosts(postsFromServer);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetPosts();
  }, []);

  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* Header */}
        <View style={{ 
          backgroundColor: '#3b82f6', 
          paddingTop: 60, 
          paddingBottom: 30, 
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8
        }}>
          <Text style={{ 
            fontSize: 32, 
            fontWeight: '700', 
            color: 'white', 
            textAlign: 'center',
            marginBottom: 8
          }}>Community</Text>
          <Text style={{ 
            fontSize: 16, 
            color: 'rgba(255,255,255,0.8)', 
            textAlign: 'center',
            fontWeight: '300'
          }}>Share your fitness journey</Text>
        </View>

        {/* Content */}
        <View style={{ padding: 20, marginTop: -15 }}>
          
          {/* Create Post Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#fffbeb', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>✍️</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>Create Post</Text>
            </View>
            
            <CreatePostForm onPostCreated={fetchAndSetPosts} />
          </View>

          {/* Posts Section */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: '#eff6ff', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginRight: 12
              }}>
                <Text style={{ fontSize: 18 }}>💬</Text>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1e293b' }}>
                Community Posts ({posts.length})
              </Text>
            </View>

            {error && (
              <View style={{
                backgroundColor: '#fef2f2',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444'
              }}>
                <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>{error}</Text>
              </View>
            )}

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color="#ec4899" size="large" />
                <Text style={{ color: '#64748b', marginTop: 12, fontSize: 16 }}>Loading posts...</Text>
              </View>
            ) : posts.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: 8,
                  textAlign: 'center'
                }}>
                  No Posts Yet
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#64748b', 
                  textAlign: 'center',
                  lineHeight: 20
                }}>
                  Be the first to share your fitness journey with the community!
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={{ maxHeight: 400 }} 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {posts.map((post) => (
                  <View key={post._id} style={{ marginBottom: 16 }}>
                    <Post
                      post={post}
                      onDelete={(id) => {
                        setPosts((prev) => prev.filter((p) => p._id !== id));
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: '#64748b',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>←</Text>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}