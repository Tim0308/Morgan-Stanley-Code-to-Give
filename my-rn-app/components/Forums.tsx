import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import forumData from "./CommunityPage_MockUp.json";

interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
}

interface Post {
  id: string;
  title: string;
  preview: string;
  fullContent: string;
  author: string;
  timeAgo: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isLiked?: boolean;
}

interface ForumCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  posts: Post[];
}

function EmptyState() {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: "#666" }}>No categories found.</Text>
    </View>
  );
}

export default function Forums() {
  const [selectedCategory, setSelectedCategory] =
    useState<ForumCategory | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  // Use state to track dynamic data changes
  const [categories, setCategories] = useState<ForumCategory[]>(
    forumData.forumCategories || []
  );

  const handleCategoryPress = (category: ForumCategory) => {
    // Toggle category selection - if same category clicked, deselect it
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const handlePostPress = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleBackPress = () => {
    if (selectedPost) {
      setSelectedPost(null);
      setShowReplyInput(false);
      setReplyText("");
    }
    // Remove the else clause - no longer navigate back from categories
  };

  const handleLikePost = (postId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        posts: category.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked,
              }
            : post
        ),
      }))
    );

    // Update selected post if it's the current one
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
              isLiked: !prev.isLiked,
            }
          : null
      );
    }
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        posts: category.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        likes: comment.isLiked
                          ? comment.likes - 1
                          : comment.likes + 1,
                        isLiked: !comment.isLiked,
                      }
                    : comment
                ),
              }
            : post
        ),
      }))
    );

    // Update selected post comments if it's the current one
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.isLiked
                        ? comment.likes - 1
                        : comment.likes + 1,
                      isLiked: !comment.isLiked,
                    }
                  : comment
              ),
            }
          : null
      );
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedPost) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: "You",
      content: replyText.trim(),
      timeAgo: "Just now",
      likes: 0,
      isLiked: false,
    };

    setCategories((prevCategories) =>
      prevCategories.map((category) => ({
        ...category,
        posts: category.posts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                comments: [...post.comments, newComment],
                commentsCount: post.commentsCount + 1,
              }
            : post
        ),
      }))
    );

    // Update selected post
    setSelectedPost((prev) =>
      prev
        ? {
            ...prev,
            comments: [...prev.comments, newComment],
            commentsCount: prev.commentsCount + 1,
          }
        : null
    );

    setReplyText("");
    setShowReplyInput(false);
  };

  const renderCategories = () => {
    if (!categories.length) return <EmptyState />;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Category Grid - 2x2 layout */}
        <View style={styles.categoryGrid}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { width: "48%" },
                selectedCategory?.id === category.id &&
                  styles.categoryCardSelected,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
                color={
                  selectedCategory?.id === category.id
                    ? "white"
                    : category.color
                }
              />
              <Text
                style={[
                  styles.categoryTitle,
                  selectedCategory?.id === category.id &&
                    styles.categoryTitleSelected,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Category Posts */}
        {selectedCategory && (
          <View style={styles.selectedCategorySection}>
            <Text style={styles.selectedCategoryTitle}>
              {selectedCategory.title} Discussions
            </Text>
            <View style={styles.postsPreview}>
              {selectedCategory.posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postPreviewCard}
                  onPress={() => handlePostPress(post)}
                >
                  <View style={styles.postHeader}>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <View style={styles.replyBadge}>
                      <Text style={styles.replyText}>Rep</Text>
                    </View>
                  </View>

                  <Text style={styles.postPreview} numberOfLines={2}>
                    {post.preview}
                  </Text>

                  <View style={styles.postFooter}>
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>by {post.author}</Text>
                      <Text style={styles.postTime}>{post.timeAgo}</Text>
                    </View>
                    <View style={styles.postStats}>
                      <View style={styles.statItem}>
                        <Ionicons
                          name={post.isLiked ? "heart" : "heart-outline"}
                          size={16}
                          color="#ef4444"
                        />
                        <Text style={styles.statText}>{post.likes}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={16}
                          color="#3b82f6"
                        />
                        <Text style={styles.statText}>
                          {post.commentsCount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Default Sample Posts (when no category selected) */}
        {!selectedCategory && (
          <View style={styles.postsPreview}>
            <Text style={styles.samplePostsTitle}>Recent Discussions</Text>
            {categories[0]?.posts.slice(0, 2).map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postPreviewCard}
                onPress={() => handlePostPress(post)}
              >
                <View style={styles.postHeader}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={styles.replyBadge}>
                    <Text style={styles.replyText}>Rep</Text>
                  </View>
                </View>

                <Text style={styles.postPreview} numberOfLines={2}>
                  {post.preview}
                </Text>

                <View style={styles.postFooter}>
                  <View style={styles.postAuthorInfo}>
                    <Text style={styles.postAuthor}>by {post.author}</Text>
                    <Text style={styles.postTime}>{post.timeAgo}</Text>
                  </View>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <Ionicons
                        name={post.isLiked ? "heart" : "heart-outline"}
                        size={16}
                        color="#ef4444"
                      />
                      <Text style={styles.statText}>{post.likes}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color="#3b82f6"
                      />
                      <Text style={styles.statText}>{post.commentsCount}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPostDetail = (post: Post) => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Discussion</Text>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Content */}
          <View style={styles.postDetailCard}>
            <Text style={styles.postDetailTitle}>{post.title}</Text>
            <Text style={styles.postDetailContent}>{post.fullContent}</Text>

            <View style={styles.postDetailFooter}>
              <Text style={styles.postDetailAuthor}>by {post.author}</Text>
              <Text style={styles.postDetailTime}>{post.timeAgo}</Text>

              <View style={styles.postDetailStats}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikePost(post.id)}
                >
                  <Ionicons
                    name={post.isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color="#ef4444"
                  />
                  <Text style={styles.actionText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowReplyInput(!showReplyInput)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#3b82f6"
                  />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Reply Input */}
          {showReplyInput && (
            <View style={styles.replySection}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write your reply..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={3}
              />
              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowReplyInput(false);
                    setReplyText("");
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !replyText.trim() && styles.submitButtonDisabled,
                  ]}
                  onPress={handleReply}
                  disabled={!replyText.trim()}
                >
                  <Text
                    style={[
                      styles.submitText,
                      !replyText.trim() && styles.submitTextDisabled,
                    ]}
                  >
                    Post Reply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({post.commentsCount})
            </Text>

            {post.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <TouchableOpacity
                  style={styles.commentLike}
                  onPress={() => handleLikeComment(post.id, comment.id)}
                >
                  <Ionicons
                    name={comment.isLiked ? "heart" : "heart-outline"}
                    size={16}
                    color="#ef4444"
                  />
                  <Text style={styles.commentLikeText}>{comment.likes}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderCategories()}
      {selectedPost && renderPostDetail(selectedPost)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // Categories View
  featuredCategory: {
    backgroundColor: "#2c3e50",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 6,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  categoryCardSelected: {
    backgroundColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.3,
  },
  categoryTitleSelected: {
    color: "white",
  },

  // Selected Category Section
  selectedCategorySection: {
    paddingHorizontal: 4,
  },
  selectedCategoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  samplePostsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },

  // Posts Preview Section
  postsPreview: {
    paddingHorizontal: 16,
  },
  postPreviewCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  // Posts View
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  postCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  replyBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  replyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  postPreview: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postAuthorInfo: {
    flexDirection: "column",
  },
  postAuthor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: "#666",
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },

  // Post Detail
  postDetailCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  postDetailTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  postDetailContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 16,
  },
  postDetailFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  postDetailAuthor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  postDetailTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  postDetailStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 4,
  },

  // Comments
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  commentContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#f9fafb",
  },
  commentLikeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },

  // Reply Section
  replySection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  submitText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  submitTextDisabled: {
    color: "#9ca3af",
  },
});
