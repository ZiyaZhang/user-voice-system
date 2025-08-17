import { create } from 'zustand';

export interface Feedback {
  id: string;
  type: string;
  content: string;
  date: string;
  product: string;
}

interface FeedbackStore {
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
  addFeedback: (feedback: Feedback) => void;
  updateFeedback: (id: string, feedback: Partial<Feedback>) => void;
  removeFeedback: (id: string) => void;
}

const useFeedbackStore = create<FeedbackStore>((set) => ({
  feedbacks: [],
  setFeedbacks: (feedbacks) => set({ feedbacks }),
  addFeedback: (feedback) => set((state) => ({ feedbacks: [feedback, ...state.feedbacks] })),
  updateFeedback: (id, feedback) => set((state) => ({
    feedbacks: state.feedbacks.map((f) => f.id === id ? { ...f, ...feedback } : f),
  })),
  removeFeedback: (id) => set((state) => ({
    feedbacks: state.feedbacks.filter((f) => f.id !== id),
  })),
}));

export default useFeedbackStore;
