import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { api, BookletWithModules, UserProfile } from "../lib/api";
import { useCache } from "../contexts/CacheContext";
import { useTranslation } from "../contexts/TranslationContext";
import DraggableExplainButton from "./DraggableExplainButton";

interface Task {
  type: "pen-paper" | "app";
  label: string;
  icon: string;
  actionIcon?: string;
  status: "not_started" | "in_progress" | "completed";
  hasProof?: boolean; // Track if proof was uploaded for pen & paper tasks
}

interface WorkItem {
  id: string;
  subject: string;
  title: string;
  date: string;
  tasks: Task[];
  backgroundColor: string;
  status: "current" | "completed";
}

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState("Homework");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showCompletedWork, setShowCompletedWork] = useState(false);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [inAppTaskModalVisible, setInAppTaskModalVisible] = useState(false);
  const [selectedInAppTaskId, setSelectedInAppTaskId] = useState<string | null>(
    null
  );
  const [currentTaskStep, setCurrentTaskStep] = useState(0);

  // Create ref for assignment modal to capture for AI
  const assignmentModalRef = useRef<View>(null);
  // Create ref for in-app task modal to capture for AI
  const inAppTaskModalRef = useRef<View>(null);

  // Use cache instead of local state
  const {
    getUserProfile,
    getChildren,
    getBookletsForChild,
    updateCache,
    refreshData,
    isLoading: cacheLoading,
    error: cacheError,
  } = useCache();

  const { t } = useTranslation();

  // Get data from cache
  const userProfile = getUserProfile();
  const children = getChildren();

  // Set selected child on component mount
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Get booklets for selected child
  const booklets = selectedChildId ? getBookletsForChild(selectedChildId) : [];

  const loadLearnData = async () => {
    try {
      setLoading(true);
      setError(null);
      await refreshData();
    } catch (err) {
      console.error("Error refreshing learn data:", err);
      setError("Failed to refresh learning materials");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraAction = async (activityId: string, taskType: string) => {
    if (taskType === "pen-paper") {
      // Handle pen-paper tasks
      try {
        // Check if proof already exists
        const existingProof = getExistingProofUrl(activityId);

        if (existingProof) {
          // Show options to view or delete existing proof
          Alert.alert(
            "Proof Already Uploaded",
            "You have already uploaded proof for this task. What would you like to do?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "View Image",
                onPress: () => viewProofImage(existingProof),
              },
              {
                text: "Delete & Upload New",
                style: "destructive",
                onPress: () => deleteProofImage(activityId),
              },
            ]
          );
        } else {
          // Show camera options
          Alert.alert(
            "Upload Proof",
            "Please take a photo or choose from gallery to upload proof of your work.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Take Photo",
                onPress: () => openCamera(activityId),
              },
              {
                text: "Choose from Gallery",
                onPress: () => openImagePicker(activityId),
              },
            ]
          );
        }
      } catch (error) {
        console.error("Camera action error:", error);
        Alert.alert("Error", "Could not process request. Please try again.");
      }
    } else if (taskType === "app") {
      // Handle in-app tasks
      handleInAppTaskStart(activityId);
    }
  };

  const openCamera = async (activityId: string) => {
    try {
      // Request camera permissions
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        Alert.alert(t.permissionRequired, t.cameraAccessNeeded);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProofImage(result.assets[0].uri, activityId);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t.error, "Failed to open camera. Please try again.");
    }
  };

  const openImagePicker = async (activityId: string) => {
    try {
      // Request media library permissions
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaPermission.status !== "granted") {
        Alert.alert(t.permissionRequired, t.photoLibraryAccessNeeded);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProofImage(result.assets[0].uri, activityId);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(t.error, "Failed to open image picker. Please try again.");
    }
  };

  const uploadProofImage = async (imageUri: string, activityId: string) => {
    if (!selectedChildId) return;

    try {
      setUploadingProof(activityId);

      // Create FormData for file upload
      const formData = new FormData();

      // Get file info from URI
      const filename = imageUri.split("/").pop() || "proof.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // Append file to FormData
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      formData.append("activity_id", activityId);
      formData.append("child_id", selectedChildId);

      // Upload image to backend
      const result = await api.uploadProofImage(formData);

      // Update cache with the new proof URL
      if (selectedChildId && result.proof_url) {
        const currentBooklets = getBookletsForChild(selectedChildId);
        const updatedBooklets = currentBooklets.map((booklet: any) => ({
          ...booklet,
          modules: booklet.modules.map((module: any) => ({
            ...module,
            activities: module.activities.map((activity: any) => {
              if (activity.id === activityId) {
                return {
                  ...activity,
                  progress: {
                    ...activity.progress,
                    proof_url: result.proof_url,
                  },
                };
              }
              return activity;
            }),
          })),
        }));

        // Update cache with new data
        updateCache({
          booklets: [
            ...booklets.filter((b: any) => b.child_id !== selectedChildId),
            ...updatedBooklets.map((b: any) => ({
              ...b,
              child_id: selectedChildId,
            })),
          ],
        });
      }

      // Show success message
      Alert.alert(
        "Proof Uploaded!",
        "Your work proof has been submitted successfully.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Upload proof error:", error);
      Alert.alert(
        "Upload Failed",
        "Could not upload proof image. Please try again."
      );
    } finally {
      setUploadingProof(null);
    }
  };

  // Helper function to get existing proof URL for an activity
  const getExistingProofUrl = (activityId: string): string | null => {
    if (!selectedChildId) return null;

    const currentBooklets = getBookletsForChild(selectedChildId);
    for (const booklet of currentBooklets) {
      for (const module of booklet.modules) {
        for (const activity of module.activities) {
          if (activity.id === activityId && activity.progress?.proof_url) {
            return activity.progress.proof_url;
          }
        }
      }
    }
    return null;
  };

  // Function to view proof image in modal
  const viewProofImage = (imageUrl: string) => {
    if (imageUrl && imageUrl.trim()) {
      setSelectedImageUrl(imageUrl);
      setImageModalVisible(true);
    } else {
      Alert.alert("Error", "Invalid image URL");
    }
  };

  // Function to delete proof image
  const deleteProofImage = async (activityId: string) => {
    if (!selectedChildId) return;

    try {
      setUploadingProof(activityId);

      // Call API to delete proof
      await api.deleteProofImage(activityId, selectedChildId);

      // Update cache to remove proof URL
      const currentBooklets = getBookletsForChild(selectedChildId);
      const updatedBooklets = currentBooklets.map((booklet: any) => ({
        ...booklet,
        modules: booklet.modules.map((module: any) => ({
          ...module,
          activities: module.activities.map((activity: any) => {
            if (activity.id === activityId) {
              return {
                ...activity,
                progress: {
                  ...activity.progress,
                  proof_url: null,
                },
              };
            }
            return activity;
          }),
        })),
      }));

      // Update cache with new data
      updateCache({
        booklets: [
          ...booklets.filter((b: any) => b.child_id !== selectedChildId),
          ...updatedBooklets.map((b: any) => ({
            ...b,
            child_id: selectedChildId,
          })),
        ],
      });

      // Show success message and then show upload options
      Alert.alert(
        "Proof Deleted!",
        "The proof image has been deleted successfully. You can now upload a new one.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Take Photo",
            onPress: () => openCamera(activityId),
          },
          {
            text: "Choose from Gallery",
            onPress: () => openImagePicker(activityId),
          },
        ]
      );
    } catch (error) {
      console.error("Delete proof error:", error);
      Alert.alert(
        "Delete Failed",
        "Could not delete proof image. Please try again."
      );
    } finally {
      setUploadingProof(null);
    }
  };

  // Function to view assignment
  const handleViewAssignment = (activityId: string) => {
    setSelectedAssignmentId(activityId);
    setAssignmentModalVisible(true);
  };

  // Function to get assignment image based on activity ID
  const getAssignmentImage = (activityId: string) => {
    // For demo purposes, return the demo image for all pen & paper activities
    // In a real app, you'd map specific activity IDs to their corresponding assignment images
    return require("./LearnPage_material_demo/pen_paper_work1.jpg");
  };

  // Mock data for in-app color learning task
  const getColorLearningTasks = () => {
    return [
      {
        step: 1,
        title: "Learn Primary Colors",
        instruction: "Tap on each primary color below to learn about them!",
        colors: [
          {
            name: "Red",
            hex: "#FF0000",
            description: "Red is the color of fire and blood.",
          },
          {
            name: "Blue",
            hex: "#0000FF",
            description: "Blue is the color of the sky and ocean.",
          },
          {
            name: "Yellow",
            hex: "#FFFF00",
            description: "Yellow is the color of the sun and bananas.",
          },
        ],
        completed: false,
      },
      {
        step: 2,
        title: "Learn Secondary Colors",
        instruction:
          "These colors are made by mixing two primary colors together!",
        colors: [
          {
            name: "Green",
            hex: "#00FF00",
            description:
              "Green = Blue + Yellow. It's the color of grass and leaves.",
          },
          {
            name: "Orange",
            hex: "#FFA500",
            description:
              "Orange = Red + Yellow. It's the color of oranges and carrots.",
          },
          {
            name: "Purple",
            hex: "#800080",
            description:
              "Purple = Red + Blue. It's the color of grapes and violets.",
          },
        ],
        completed: false,
      },
      {
        step: 3,
        title: "Color Mixing Quiz",
        instruction: "Can you match the colors correctly?",
        questions: [
          {
            question: "What color do you get when you mix Red + Yellow?",
            answer: "Orange",
            options: ["Green", "Orange", "Purple"],
          },
          {
            question: "What color do you get when you mix Blue + Yellow?",
            answer: "Green",
            options: ["Orange", "Green", "Purple"],
          },
          {
            question: "What color do you get when you mix Red + Blue?",
            answer: "Purple",
            options: ["Green", "Orange", "Purple"],
          },
        ],
        completed: false,
      },
    ];
  };

  // Handle in-app task start
  const handleInAppTaskStart = (activityId: string) => {
    // For demo, we'll assume this is the color learning task
    if (activityId.includes("colors") || activityId === "activity_1" || true) {
      // Always true for demo
      setSelectedInAppTaskId(activityId);
      setCurrentTaskStep(0);
      setInAppTaskModalVisible(true);
    }
  };

  // Handle task step completion
  const completeCurrentStep = () => {
    const tasks = getColorLearningTasks();
    if (currentTaskStep < tasks.length - 1) {
      setCurrentTaskStep(currentTaskStep + 1);
    } else {
      // Task completed
      Alert.alert(
        "Congratulations! 🎉",
        "You've completed the color learning activity! Great job!",
        [
          {
            text: "Finish",
            onPress: () => {
              setInAppTaskModalVisible(false);
              setCurrentTaskStep(0);
            },
          },
        ]
      );
    }
  };

  // Transform booklets into work items
  const generateWorkItems = (): WorkItem[] => {
    const workItems: WorkItem[] = [];

    booklets.forEach((booklet: any) => {
      booklet.modules.forEach((module: any) => {
        module.activities.forEach((activity: any) => {
          // Convert activity to work item
          const hasProof = activity.progress?.proof_url ? true : false;

          const tasks: Task[] = [
            {
              type: activity.type === "pen_paper" ? "pen-paper" : "app",
              label:
                activity.type === "pen_paper"
                  ? "Pen & Paper Work"
                  : "In-App Task",
              icon: activity.type === "pen_paper" ? "camera" : "play-circle",
              actionIcon: activity.type === "pen_paper" ? "camera" : "play",
              status: activity.progress?.status || "not_started",
              hasProof: hasProof, // Add this to track if proof was uploaded
            },
          ];

          const subjectColors: { [key: string]: string } = {
            Reading: "#f0f9ff",
            Math: "#fef3c7",
            Science: "#f0fdf4",
            Writing: "#faf5ff",
            default: "#f9fafb",
          };

          workItems.push({
            id: activity.id,
            subject: booklet.subject || "Learning",
            title: activity.title || `${booklet.title} - ${module.title}`,
            date: new Date().toLocaleDateString("en-GB"),
            tasks,
            backgroundColor:
              subjectColors[booklet.subject || "default"] ||
              subjectColors.default,
            status:
              activity.progress?.status === "completed"
                ? "completed"
                : "current",
          });
        });
      });
    });

    return workItems;
  };

  const workItems = generateWorkItems();

  // Limit current work to 3 items, prioritize in_progress first, then not_started
  const allCurrentWork = workItems.filter((item) => item.status === "current");
  const inProgressWork = allCurrentWork.filter(
    (item) => item.tasks[0].status === "in_progress"
  );
  const notStartedWork = allCurrentWork.filter(
    (item) => item.tasks[0].status === "not_started"
  );

  // Take up to 3 current work items (prioritize in_progress)
  const currentWork = [
    ...inProgressWork.slice(0, 2), // Up to 2 in-progress items
    ...notStartedWork.slice(0, 3 - Math.min(2, inProgressWork.length)), // Fill remaining with not-started
  ];

  const completedWork = workItems.filter((item) => item.status === "completed");

  if (loading || cacheLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Learn</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading learning materials...</Text>
        </View>
      </View>
    );
  }

  if (error || cacheError) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Learn</Text>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || cacheError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLearnData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t.learn}</Text>

        {/* Homework/Materials Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "Homework" && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab("Homework")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Homework" && styles.selectedTabText,
              ]}
            >
              {t.homework}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "Materials" && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab("Materials")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "Materials" && styles.selectedTabText,
              ]}
            >
              {t.materials}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === "Homework" ? (
          <View>
            {/* Homework Calendar Section */}
            <View style={styles.calendarSection}>
              <Text style={styles.calendarTitle}>{t.homeworkCalendar}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.calendarScroll}
              >
                <View style={styles.calendarContainer}>
                  <View style={[styles.weekCard, styles.completedWeek]}>
                    <View style={styles.weekIcon}>
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
                    </View>
                    <Text style={styles.weekTitle}>Week 1</Text>
                    <Text style={styles.weekDates}>12-18 Aug</Text>
                    <Text style={styles.weekTasks}>2 tasks</Text>
                  </View>

                  <View style={[styles.weekCard, styles.currentWeek]}>
                    <View style={styles.weekIconCurrent}>
                      <Text style={styles.weekNumber}>2</Text>
                    </View>
                    <Text style={styles.weekTitle}>Week 2</Text>
                    <Text style={styles.weekDates}>19-25 Aug</Text>
                    <Text style={styles.weekTasks}>2 tasks</Text>
                  </View>

                  <View style={[styles.weekCard, styles.upcomingWeek]}>
                    <View style={styles.weekIconUpcoming}>
                      <Text style={styles.weekNumberUpcoming}>3</Text>
                    </View>
                    <Text style={styles.weekTitleUpcoming}>Week 3</Text>
                    <Text style={styles.weekDatesUpcoming}>26 Aug - 1 Sep</Text>
                    <Text style={styles.weekTasksUpcoming}>3 tasks</Text>
                  </View>

                  <View style={[styles.weekCard, styles.upcomingWeek]}>
                    <View style={styles.weekIconUpcoming}>
                      <Text style={styles.weekNumberUpcoming}>4</Text>
                    </View>
                    <Text style={styles.weekTitleUpcoming}>Week 4</Text>
                    <Text style={styles.weekDatesUpcoming}>2-8 Sep</Text>
                    <Text style={styles.weekTasksUpcoming}>2 tasks</Text>
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Current Work Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="timer-outline" size={20} color="#f97316" />
              <Text style={styles.sectionTitle}>{t.currentWork}</Text>
            </View>

            {currentWork.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
                <Text style={styles.emptyStateText}>{t.allCaughtUp}</Text>
                <Text style={styles.emptyStateSubtext}>
                  {t.noPendingHomework}
                </Text>
              </View>
            ) : (
              currentWork.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.workCard,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  <View style={styles.workHeader}>
                    <View style={styles.subjectBadge}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                    </View>
                    <Text style={styles.workDate}>{item.date}</Text>
                  </View>

                  <Text style={styles.workTitle}>{item.title}</Text>

                  <View style={styles.tasksContainer}>
                    {item.tasks.map((task, index) => (
                      <View
                        key={index}
                        style={[
                          styles.taskItem,
                          task.hasProof &&
                            task.type === "pen-paper" &&
                            styles.taskItemWithProof,
                        ]}
                      >
                        <View style={styles.taskInfo}>
                          <Ionicons
                            name={task.icon as any}
                            size={16}
                            color={
                              task.hasProof && task.type === "pen-paper"
                                ? "#22c55e"
                                : "#666"
                            }
                          />
                          <Text
                            style={[
                              styles.taskLabel,
                              task.hasProof &&
                                task.type === "pen-paper" &&
                                styles.taskLabelWithProof,
                            ]}
                          >
                            {task.label}
                          </Text>
                          {task.hasProof && task.type === "pen-paper" && (
                            <View style={styles.proofIndicator}>
                              <Ionicons
                                name="checkmark-circle"
                                size={14}
                                color="#22c55e"
                              />
                              <Text style={styles.proofText}>Pending</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.taskActions}>
                          {/* View Assignment Button for Pen & Paper tasks - Hide when proof is uploaded */}
                          {task.type === "pen-paper" && !task.hasProof && (
                            <TouchableOpacity
                              style={styles.viewAssignmentButton}
                              onPress={() => handleViewAssignment(item.id)}
                            >
                              <Ionicons
                                name="eye-outline"
                                size={16}
                                color="#8b5cf6"
                              />
                              <Text style={styles.viewAssignmentText}>
                                View
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* Main Action Button */}
                          <TouchableOpacity
                            style={[
                              styles.taskAction,
                              task.hasProof &&
                                task.type === "pen-paper" &&
                                styles.taskActionWithProof,
                            ]}
                            onPress={() =>
                              handleCameraAction(item.id, task.type)
                            }
                            disabled={uploadingProof === item.id}
                          >
                            {uploadingProof === item.id ? (
                              <ActivityIndicator size="small" color="#1a1a2e" />
                            ) : (
                              <Ionicons
                                name={
                                  task.hasProof && task.type === "pen-paper"
                                    ? "image" // Show image icon when proof exists
                                    : (task.actionIcon as any)
                                }
                                size={16}
                                color={
                                  task.hasProof && task.type === "pen-paper"
                                    ? "#22c55e" // Green for existing proof
                                    : "#1a1a2e"
                                }
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}

            {/* Show More Current Work Button */}
            {/* {allCurrentWork.length > 3 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                Show More Assignments ({allCurrentWork.length - 3} more)
              </Text>
            </TouchableOpacity>
          )} */}

            {/* Completed Work Section */}
            {completedWork.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setShowCompletedWork(!showCompletedWork)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  <Text style={styles.sectionTitle}>{t.completedWork}</Text>
                  <View style={styles.sectionToggle}>
                    <Text style={styles.completedCount}>
                      ({completedWork.length - 3})
                    </Text>
                    <Ionicons
                      name={showCompletedWork ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#666"
                    />
                  </View>
                </TouchableOpacity>

                {showCompletedWork && (
                  <>
                    {completedWork.slice(0, 3).map((item) => (
                      <View
                        key={item.id}
                        style={[styles.workCard, styles.completedCard]}
                      >
                        <View style={styles.workHeader}>
                          <View
                            style={[styles.subjectBadge, styles.completedBadge]}
                          >
                            <Text
                              style={[styles.subjectText, styles.completedText]}
                            >
                              {item.subject}
                            </Text>
                          </View>
                          <Text style={styles.workDate}>{item.date}</Text>
                        </View>

                        <Text style={[styles.workTitle, styles.completedTitle]}>
                          {item.title}
                        </Text>

                        <View style={styles.completedIndicator}>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#22c55e"
                          />
                          <Text style={styles.completedLabel}>Completed</Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        ) : (
          /* Materials Tab */
          <View style={styles.materialsSection}>
            {booklets.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="library-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>
                  {t.noMaterialsAvailable}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {t.materialsWillAppearHere}
                </Text>
              </View>
            ) : (
              booklets.slice(0, 3).map(
                (
                  booklet: any // Limit to first 3 booklets
                ) => (
                  <View key={booklet.id} style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                      <Ionicons name="book" size={24} color="#8b5cf6" />
                      <View style={styles.materialInfo}>
                        <Text style={styles.materialTitle}>
                          {booklet.title}
                        </Text>
                        {booklet.subtitle && (
                          <Text style={styles.materialSubtitle}>
                            {booklet.subtitle}
                          </Text>
                        )}
                      </View>
                      <View style={styles.materialBadge}>
                        <Text style={styles.materialBadgeText}>
                          {booklet.subject}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.moduleCount}>
                      {booklet.modules.length} modules •{" "}
                      {booklet.modules.reduce(
                        (acc: number, mod: any) => acc + mod.activities.length,
                        0
                      )}{" "}
                      activities
                    </Text>

                    <TouchableOpacity style={styles.viewMaterialButton}>
                      <Text style={styles.viewMaterialText}>View Material</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#8b5cf6"
                      />
                    </TouchableOpacity>
                  </View>
                )
              )
            )}

            {/* Show More Materials Button */}
            {/* {booklets.length > 3 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                Show More Materials ({booklets.length - 3} more)
              </Text>
            </TouchableOpacity>
          )} */}
          </View>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Uploaded Proof</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            {selectedImageUrl ? (
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text>Loading image...</Text>
              </View>
            )}
          </View>

          {/* Modal Footer with Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.modalActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assignment Viewer Modal */}
      <Modal
        visible={assignmentModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setAssignmentModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View
          style={styles.modalContainer}
          ref={assignmentModalRef}
          collapsable={false}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Assignment to Complete</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAssignmentModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Assignment Image */}
          <View style={styles.imageContainer}>
            {selectedAssignmentId ? (
              <Image
                source={getAssignmentImage(selectedAssignmentId)}
                style={styles.modalImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text>Loading assignment...</Text>
              </View>
            )}
          </View>

          {/* Modal Footer with Actions */}
          <View style={styles.modalFooter}>
            <View style={styles.assignmentFooterContent}>
              <View style={styles.assignmentInstructions}>
                <Ionicons name="information-circle" size={20} color="#8b5cf6" />
                <Text style={styles.instructionText}>
                  Have your child complete this worksheet, then take a photo to
                  upload as proof of work.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => setAssignmentModalVisible(false)}
              >
                <Text style={styles.modalActionText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Explain Button for Assignment Modal */}
          <DraggableExplainButton screenRef={assignmentModalRef} />
        </View>
      </Modal>

      {/* In-App Color Learning Task Modal */}
      <Modal
        visible={inAppTaskModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setInAppTaskModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View
          style={styles.modalContainer}
          ref={inAppTaskModalRef}
          collapsable={false}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {getColorLearningTasks()[currentTaskStep]?.title ||
                "Color Learning"}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setInAppTaskModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Task Content */}
          <ScrollView
            style={styles.taskContent}
            showsVerticalScrollIndicator={false}
          >
            {getColorLearningTasks()[currentTaskStep] && (
              <View style={styles.taskStepContainer}>
                <Text style={styles.taskInstruction}>
                  {getColorLearningTasks()[currentTaskStep].instruction}
                </Text>

                {/* Step 1 & 2: Color Learning */}
                {(currentTaskStep === 0 || currentTaskStep === 1) && (
                  <View style={styles.colorsGrid}>
                    {getColorLearningTasks()[currentTaskStep].colors?.map(
                      (color, index) => (
                        <TouchableOpacity key={index} style={styles.colorCard}>
                          <View
                            style={[
                              styles.colorCircle,
                              { backgroundColor: color.hex },
                            ]}
                          />
                          <Text style={styles.colorName}>{color.name}</Text>
                          <Text style={styles.colorDescription}>
                            {color.description}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}

                {/* Step 3: Quiz */}
                {currentTaskStep === 2 && (
                  <View style={styles.quizContainer}>
                    {getColorLearningTasks()[currentTaskStep].questions?.map(
                      (question, index) => (
                        <View key={index} style={styles.questionCard}>
                          <Text style={styles.questionText}>
                            {question.question}
                          </Text>
                          <View style={styles.optionsContainer}>
                            {question.options.map((option, optIndex) => (
                              <TouchableOpacity
                                key={optIndex}
                                style={[
                                  styles.optionButton,
                                  option === question.answer &&
                                    styles.correctOption,
                                ]}
                                onPress={() => {
                                  if (option === question.answer) {
                                    Alert.alert(
                                      "Correct! 🎉",
                                      `Yes! ${question.answer} is the right answer!`
                                    );
                                  } else {
                                    Alert.alert(
                                      "Try Again",
                                      `Not quite. The correct answer is ${question.answer}.`
                                    );
                                  }
                                }}
                              >
                                <Text
                                  style={[
                                    styles.optionText,
                                    option === question.answer &&
                                      styles.correctOptionText,
                                  ]}
                                >
                                  {option}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )
                    )}
                  </View>
                )}

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Step {currentTaskStep + 1} of{" "}
                    {getColorLearningTasks().length}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            ((currentTaskStep + 1) /
                              getColorLearningTasks().length) *
                            100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer with Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={completeCurrentStep}
            >
              <Text style={styles.modalActionText}>
                {currentTaskStep === getColorLearningTasks().length - 1
                  ? "Complete Task"
                  : "Next Step"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* AI Explain Button for In-App Task Modal */}
          <DraggableExplainButton screenRef={inAppTaskModalRef} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  selectedTabText: {
    color: "#1a1a2e",
    fontWeight: "600",
  },

  // Calendar styles
  calendarSection: {
    marginBottom: 24,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  calendarScroll: {
    marginHorizontal: -20,
  },
  calendarContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  weekCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  completedWeek: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  currentWeek: {
    backgroundColor: "#f3e8ff",
    borderWidth: 1,
    borderColor: "#c4b5fd",
  },
  upcomingWeek: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  weekIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#22c55e",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  weekIconCurrent: {
    width: 32,
    height: 32,
    backgroundColor: "#a855f7",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  weekIconUpcoming: {
    width: 32,
    height: 32,
    backgroundColor: "#9ca3af",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  weekNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  weekNumberUpcoming: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  weekTitleUpcoming: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 4,
  },
  weekDates: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  weekDatesUpcoming: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  weekTasks: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  weekTasksUpcoming: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "500",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  completedCount: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  workCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  completedCard: {
    backgroundColor: "#f9fafb",
    opacity: 0.8,
  },
  workHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: "#e5e7eb",
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  completedText: {
    color: "#666",
  },
  workDate: {
    fontSize: 12,
    color: "#666",
  },
  workTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  completedTitle: {
    color: "#666",
  },
  tasksContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 12,
    borderRadius: 8,
  },
  taskItemWithProof: {
    backgroundColor: "rgba(34, 197, 94, 0.1)", // Light green background
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  taskLabelWithProof: {
    color: "#22c55e",
    fontWeight: "500",
  },
  proofIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 12,
  },
  proofText: {
    fontSize: 10,
    color: "#22c55e",
    marginLeft: 4,
    fontWeight: "500",
  },
  taskAction: {
    padding: 4,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewAssignmentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  viewAssignmentText: {
    fontSize: 12,
    color: "#8b5cf6",
    fontWeight: "500",
  },
  taskActionWithProof: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 6,
  },
  completedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completedLabel: {
    fontSize: 14,
    color: "#22c55e",
    marginLeft: 4,
    fontWeight: "500",
  },
  showMoreButton: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
  },
  showMoreText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  materialsSection: {
    marginBottom: 20,
  },
  materialCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  materialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  materialSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  materialBadge: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  materialBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  moduleCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  viewMaterialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewMaterialText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8b5cf6",
    marginRight: 4,
  },
  // Modal styles
  modalContainer: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalCloseButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 10,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalFooter: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  modalActionButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  modalActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  assignmentFooterContent: {
    gap: 16,
  },
  assignmentInstructions: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // In-App Task Modal Styles
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskStepContainer: {
    flex: 1,
  },
  taskInstruction: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  colorsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  colorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  colorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  colorDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  quizContainer: {
    gap: 20,
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  correctOption: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  optionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  correctOptionText: {
    color: "#22c55e",
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 2,
  },
});
