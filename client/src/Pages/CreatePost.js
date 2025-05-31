import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate, useNavigate } from "react-router-dom";
import "./CreatePost.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [files, setFiles] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState("");
  const [creationMode, setCreationMode] = useState("manual"); // "manual" or "youtube"
  const [validationErrors, setValidationErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:4000/profile", {
        credentials: "include",
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setRedirect(true);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
      setRedirect(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up an interval to check auth status periodically
    const authInterval = setInterval(checkAuth, 5000); // Check every 5 seconds

    // Cleanup function
    return () => {
      clearInterval(authInterval);
    };
  }, []);

  // Add event listener for storage changes (for cross-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout') {
        setIsAuthenticated(false);
        setRedirect(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!summary.trim()) {
      errors.summary = "Summary is required";
    }
    if (!content.trim()) {
      errors.content = "Content is required";
    }
    if (!files || files.length === 0) {
      errors.file = "Cover image is required";
    }
    if (creationMode === "youtube" && !youtubeUrl.trim()) {
      errors.youtubeUrl = "YouTube URL is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to extract summary from content
  const extractSummary = (text) => {
    // Remove HTML tags
    const plainText = text.replace(/<[^>]*>/g, '');
    // Get first paragraph (up to 200 characters)
    const firstParagraph = plainText.split('\n')[0];
    return firstParagraph.length > 200 
      ? firstParagraph.substring(0, 200) + '...'
      : firstParagraph;
  };

  async function transcribeVideo(e) {
    e.preventDefault();
    
    // Check auth status before proceeding
    await checkAuth();
    
    if (!isAuthenticated) {
      setRedirect(true);
      return;
    }

    if (!youtubeUrl) {
      setValidationErrors({ youtubeUrl: "Please enter a YouTube URL" });
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError("");
    setValidationErrors({});

    try {
      const response = await fetch("http://localhost:4000/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          url: youtubeUrl,
          improve: true
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setRedirect(true);
          return;
        }
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.title || data.title === 'Transcribed Video') {
        console.warn("Invalid title received:", data.title);
        setTranscriptionError("Failed to get video title. Please enter a title manually.");
      } else {
        setTitle(data.title);
      }
      
      setContent(data.improved || data.original);
      setSummary(extractSummary(data.improved || data.original));
    } catch (err) {
      console.error("Transcription error:", err);
      setTranscriptionError(err.message);
    } finally {
      setIsTranscribing(false);
    }
  }

  async function createNewPost(e) {
    e.preventDefault();
    
    // Check auth status before proceeding
    await checkAuth();
    
    if (!isAuthenticated) {
      setRedirect(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);    
    data.set("file", files[0]);
    data.set("content", content);

    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (response.ok) {
      setRedirect(true);
    } else if (response.status === 401) {
      setIsAuthenticated(false);
      setRedirect(true);
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <form onSubmit={createNewPost}>
      <div className="creation-mode-selector">
        <div className="dropdown">
          <button 
            type="button" 
            className="dropdown-trigger"
            onClick={() => setCreationMode(creationMode === "manual" ? "youtube" : "manual")}
          >
            {creationMode === "manual" ? "Manual Creation" : "YouTube Transcription"}
            <span className="dropdown-arrow">▼</span>
          </button>
          <div className="dropdown-menu">
            <button
              type="button"
              className={creationMode === "manual" ? "active" : ""}
              onClick={() => setCreationMode("manual")}
            >
              Manual Creation
            </button>
            <button
              type="button"
              className={creationMode === "youtube" ? "active" : ""}
              onClick={() => setCreationMode("youtube")}
            >
              YouTube Transcription
            </button>
          </div>
        </div>
      </div>

      {creationMode === "manual" ? (
        <div className="form-section manual-section">
          <div className="form-group">
            <label htmlFor="title">Title <span className="required">*</span></label>
            <input 
              id="title"
              type="text" 
              placeholder="Enter post title" 
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationErrors(prev => ({ ...prev, title: "" }));
              }}
              className={validationErrors.title ? "error" : ""}
            />
            {validationErrors.title && <div className="error-message">{validationErrors.title}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="summary">Summary <span className="required">*</span></label>
            <input 
              id="summary"
              type="text" 
              placeholder="Enter post summary" 
              value={summary} 
              onChange={(e) => {
                setSummary(e.target.value);
                setValidationErrors(prev => ({ ...prev, summary: "" }));
              }}
              className={validationErrors.summary ? "error" : ""}
            />
            {validationErrors.summary && <div className="error-message">{validationErrors.summary}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="file">Cover Image <span className="required">*</span></label>
            <input 
              id="file"
              type="file" 
              onChange={(e) => {
                setFiles(e.target.files);
                setValidationErrors(prev => ({ ...prev, file: "" }));
              }}
              className={validationErrors.file ? "error" : ""}
            />
            {validationErrors.file && <div className="error-message">{validationErrors.file}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="content">Content <span className="required">*</span></label>
            <ReactQuill 
              id="content"
              value={content} 
              modules={modules} 
              formats={formats} 
              onChange={(newValue) => {
                setContent(newValue);
                setValidationErrors(prev => ({ ...prev, content: "" }));
              }}
              className={validationErrors.content ? "error" : ""}
            />
            {validationErrors.content && <div className="error-message">{validationErrors.content}</div>}
          </div>
        </div>
      ) : (
        <div className="form-section youtube-section">
          <div className="form-group">
            <label htmlFor="youtube-url">YouTube URL <span className="required">*</span></label>
            <input
              id="youtube-url"
              type="text"
              placeholder="Enter YouTube URL"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                setValidationErrors(prev => ({ ...prev, youtubeUrl: "" }));
              }}
              className={validationErrors.youtubeUrl ? "error" : ""}
            />
            {validationErrors.youtubeUrl && <div className="error-message">{validationErrors.youtubeUrl}</div>}
          </div>
          <button 
            type="button" 
            onClick={transcribeVideo}
            disabled={isTranscribing}
            className="transcribe-button"
          >
            {isTranscribing ? "Transcribing..." : "Transcribe Video"}
          </button>
          {transcriptionError && (
            <div className="error">{transcriptionError}</div>
          )}
          
          {/* Show title, summary, file upload, and content editor after transcription */}
          {content && (
            <>
              <div className="form-group">
                <label htmlFor="transcribed-title">Title <span className="required">*</span></label>
                <input 
                  id="transcribed-title"
                  type="text" 
                  placeholder="Title" 
                  value={title} 
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setValidationErrors(prev => ({ ...prev, title: "" }));
                  }}
                  className={validationErrors.title ? "error" : ""}
                />
                {validationErrors.title && <div className="error-message">{validationErrors.title}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="transcribed-summary">Summary <span className="required">*</span></label>
                <input 
                  id="transcribed-summary"
                  type="text" 
                  placeholder="Summary" 
                  value={summary} 
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setValidationErrors(prev => ({ ...prev, summary: "" }));
                  }}
                  className={validationErrors.summary ? "error" : ""}
                />
                {validationErrors.summary && <div className="error-message">{validationErrors.summary}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="transcribed-file">Cover Image <span className="required">*</span></label>
                <input 
                  id="transcribed-file"
                  type="file" 
                  onChange={(e) => {
                    setFiles(e.target.files);
                    setValidationErrors(prev => ({ ...prev, file: "" }));
                  }}
                  className={validationErrors.file ? "error" : ""}
                />
                {validationErrors.file && <div className="error-message">{validationErrors.file}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="transcribed-content">Content <span className="required">*</span></label>
                <ReactQuill 
                  id="transcribed-content"
                  value={content} 
                  modules={modules} 
                  formats={formats} 
                  onChange={(newValue) => {
                    setContent(newValue);
                    setValidationErrors(prev => ({ ...prev, content: "" }));
                  }}
                  className={validationErrors.content ? "error" : ""}
                />
                {validationErrors.content && <div className="error-message">{validationErrors.content}</div>}
              </div>
            </>
          )}
        </div>
      )}

      <button type="submit" className="submit-button">Create Post</button>
    </form>
  );
}
