import { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface Resume {
  id: string;
  fileName: string;
  content: string;
  analysis?: {
    skills: string[];
    experience: string[];
    education: string[];
    score: number;
  };
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

interface ResumeState {
  resumes: Resume[];
  selectedResumeId: string | null;
  loading: boolean;
  error: string | null;
}

type ResumeAction =
  | { type: 'ADD_RESUME'; payload: Resume }
  | { type: 'UPDATE_RESUME'; payload: Resume }
  | { type: 'DELETE_RESUME'; payload: string }
  | { type: 'SELECT_RESUME'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: ResumeState = {
  resumes: [],
  selectedResumeId: null,
  loading: false,
  error: null,
};

// Reducer
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'ADD_RESUME':
      return {
        ...state,
        resumes: [...state.resumes, action.payload],
        error: null,
      };
    case 'UPDATE_RESUME':
      return {
        ...state,
        resumes: state.resumes.map(resume =>
          resume.id === action.payload.id ? action.payload : resume
        ),
        error: null,
      };
    case 'DELETE_RESUME':
      return {
        ...state,
        resumes: state.resumes.filter(resume => resume.id !== action.payload),
        selectedResumeId: state.selectedResumeId === action.payload ? null : state.selectedResumeId,
        error: null,
      };
    case 'SELECT_RESUME':
      return {
        ...state,
        selectedResumeId: action.payload,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

// Context
const ResumeContext = createContext<{
  state: ResumeState;
  dispatch: React.Dispatch<ResumeAction>;
} | undefined>(undefined);

// Provider component
export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook to use the resume context
export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}

// Export types
export type { Resume, ResumeState, ResumeAction }; 