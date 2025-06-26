import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate, useNavigate } from "react-router-dom";
import "./CreatePost.css";
import SummarizationSlider from './SummarizationSlider';
import ImageGenerator from './ImageGenerator';

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
  const [maxLength, setMaxLength] = useState(100);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [summarizationError, setSummarizationError] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);
  const navigate = useNavigate();
  const quillRef = useRef();
  const quillTranscribedRef = useRef();
  const quillSummaryRef = useRef();

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

  useEffect(() => {
    // Manual mode main content
    if (quillRef.current && quillRef.current.getEditor) {
      const quillEditor = quillRef.current.getEditor();
      const editorContainer = quillEditor.root;
      const handleDrop = (e) => {
        e.preventDefault();
        const imageUrl = e.dataTransfer.getData('text/uri-list');
        if (imageUrl) {
          const range = quillEditor.getSelection();
          quillEditor.insertEmbed(range ? range.index : 0, 'image', imageUrl, 'user');
        }
      };
      editorContainer.addEventListener('drop', handleDrop);
      editorContainer.addEventListener('dragover', e => e.preventDefault());
      return () => {
        editorContainer.removeEventListener('drop', handleDrop);
      };
    }
  }, [quillRef]);

  useEffect(() => {
    // YouTube mode main content
    if (quillTranscribedRef.current && quillTranscribedRef.current.getEditor) {
      const quillEditor = quillTranscribedRef.current.getEditor();
      const editorContainer = quillEditor.root;
      const handleDrop = (e) => {
        e.preventDefault();
        const imageUrl = e.dataTransfer.getData('text/uri-list');
        if (imageUrl) {
          const range = quillEditor.getSelection();
          quillEditor.insertEmbed(range ? range.index : 0, 'image', imageUrl, 'user');
        }
      };
      editorContainer.addEventListener('drop', handleDrop);
      editorContainer.addEventListener('dragover', e => e.preventDefault());
      return () => {
        editorContainer.removeEventListener('drop', handleDrop);
      };
    }
  }, [quillTranscribedRef]);

  useEffect(() => {
    // YouTube mode summary content
    if (quillSummaryRef.current && quillSummaryRef.current.getEditor) {
      const quillEditor = quillSummaryRef.current.getEditor();
      const editorContainer = quillEditor.root;
      const handleDrop = (e) => {
        e.preventDefault();
        const imageUrl = e.dataTransfer.getData('text/uri-list');
        if (imageUrl) {
          const range = quillEditor.getSelection();
          quillEditor.insertEmbed(range ? range.index : 0, 'image', imageUrl, 'user');
        }
      };
      editorContainer.addEventListener('drop', handleDrop);
      editorContainer.addEventListener('dragover', e => e.preventDefault());
      return () => {
        editorContainer.removeEventListener('drop', handleDrop);
      };
    }
  }, [quillSummaryRef]);

  // Clean up object URL when coverPreview changes
  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const validateForm = () => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!summary.trim()) {
      errors.summary = "Summary is required";
    }
    
    // Check content based on creation mode
    if (creationMode === "youtube") {
      // In YouTube mode, use summaryContent if available, otherwise use content
      const contentToCheck = summaryContent.trim() || content.trim();
      if (!contentToCheck) {
        errors.content = "Content is required. Please transcribe the video and optionally summarize it.";
      }
    } else {
      // In manual mode, check content
      if (!content.trim()) {
        errors.content = "Content is required";
      }
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
          url: youtubeUrl
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
      
      setContent(data.original);
      setSummary(extractSummary(data.original));
    } catch (err) {
      console.error("Transcription error:", err);
      setTranscriptionError(err.message);
    } finally {
      setIsTranscribing(false);
    }
  }

  async function createNewPost(e) {
    e.preventDefault();
    
    console.log("Form submission started");
    console.log("Creation mode:", creationMode);
    console.log("Title:", title);
    console.log("Summary:", summary);
    console.log("Content:", content);
    console.log("SummaryContent:", summaryContent);
    console.log("Files:", files);
    
    // Check auth status before proceeding
    await checkAuth();
    
    if (!isAuthenticated) {
      setRedirect(true);
      return;
    }

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("file", files[0]);
    
    // Use summaryContent if available in YouTube mode, otherwise use content
    const contentToSend = creationMode === "youtube" && summaryContent.trim() 
      ? summaryContent 
      : content;
    data.set("content", contentToSend);
    
    console.log("Sending content:", contentToSend);

    try {
      const response = await fetch("http://localhost:4000/post", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        // Navigate to homepage after successful post creation
        navigate('/');
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        setRedirect(true);
      } else {
        const error = await response.json();
        console.log("Server error:", error);
        setValidationErrors({ submit: error.message || 'Failed to create post' });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setValidationErrors({ submit: 'Failed to create post. Please try again.' });
    }
  }

  async function summarizeTranscript() {
    setIsSummarizing(true);
    setSummarizationError("");
    try {
      const response = await fetch("http://localhost:4000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, max_length: maxLength }),
      });
      if (!response.ok) {
        throw new Error("Summarization failed");
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSummaryContent(data.summary);
      
      // Update the summary input field with content from the summarized text
      // Extract plain text from the summarized content and use it as the summary
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.summary;
      const plainTextSummary = tempDiv.textContent || tempDiv.innerText || '';
      
      // Limit the summary to a reasonable length for the input field (e.g., 200 characters)
      const truncatedSummary = plainTextSummary.length > 200 
        ? plainTextSummary.substring(0, 200) + '...' 
        : plainTextSummary;
      
      setSummary(truncatedSummary);
    } catch (err) {
      setSummarizationError(err.message);
    } finally {
      setIsSummarizing(false);
    }
  }

  // Helper to reset all form fields
  const resetFields = () => {
    setTitle("");
    setSummary("");
    setFiles("");
    setContent("");
    setYoutubeUrl("");
    setSummaryContent("");
    setValidationErrors({});
    setTranscriptionError("");
    setSummarizationError("");
  };

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
            onClick={() => {
              if (creationMode === "manual") {
                resetFields();
                setCreationMode("youtube");
              } else {
                resetFields();
                setCreationMode("manual");
              }
            }}
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
          <ImageGenerator />
          <div className="help-text" style={{ marginBottom: 8 }}>You can also drag this image into your content.</div>
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
                if (e.target.files && e.target.files[0]) {
                  setCoverPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className={validationErrors.file ? "error" : ""}
              onDrop={e => {
                e.preventDefault();
                const url = e.dataTransfer.getData('text/uri-list');
                if (url) {
                  fetch(url)
                    .then(res => res.blob())
                    .then(blob => {
                      const file = new File([blob], 'generated-image.png', { type: blob.type });
                      setFiles({ 0: file, length: 1, item: i => file });
                      setCoverPreview(URL.createObjectURL(file));
                    });
                }
              }}
              onDragOver={e => e.preventDefault()}
            />
            {validationErrors.file && <div className="error-message">{validationErrors.file}</div>}
            {files && files[0] && coverPreview && (
              <div className="cover-preview" style={{ marginTop: 12 }}>
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '1px solid #ddd' }}
                />
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="content">Content <span className="required">*</span></label>
            <ReactQuill 
              id="content"
              ref={quillRef}
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
            <div className="help-text">
              Enter a YouTube URL to transcribe the video and get the original spoken text as your post content.
            </div>
          </div>
          <button 
            type="button" 
            onClick={transcribeVideo}
            disabled={isTranscribing}
            className="transcribe-button"
          >
            {isTranscribing ? "Transcribing..." : "Transcribe Video (Original Text)"}
          </button>
          {transcriptionError && (
            <div className="error">{transcriptionError}</div>
          )}
          {/* Show title, summary, file upload, and content editor after transcription */}
          {content && (
            <>
              <ImageGenerator />
              <div className="help-text" style={{ marginBottom: 8 }}>You can also drag this image into your content.</div>
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
                    if (e.target.files && e.target.files[0]) {
                      setCoverPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className={validationErrors.file ? "error" : ""}
                  onDrop={e => {
                    e.preventDefault();
                    const url = e.dataTransfer.getData('text/uri-list');
                    if (url) {
                      fetch(url)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], 'generated-image.png', { type: blob.type });
                          setFiles({ 0: file, length: 1, item: i => file });
                          setCoverPreview(URL.createObjectURL(file));
                        });
                    }
                  }}
                  onDragOver={e => e.preventDefault()}
                />
                {validationErrors.file && <div className="error-message">{validationErrors.file}</div>}
                {files && files[0] && coverPreview && (
                  <div className="cover-preview" style={{ marginTop: 12 }}>
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginTop: 24 }}>
                <div style={{ flex: 1 }}>
                  <div className="form-group">
                    <label htmlFor="transcribed-content">Content <span className="required">*</span></label>
                    <ReactQuill
                      id="transcribed-content"
                      ref={quillTranscribedRef}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SummarizationSlider maxLength={maxLength} setMaxLength={setMaxLength} min={20} max={1000} />
                  <button
                    type="button"
                    onClick={summarizeTranscript}
                    disabled={isSummarizing || !content}
                    className="transcribe-button"
                    style={{ marginBottom: 12 }}
                  >
                    {isSummarizing ? "Summarizing..." : "Summarize Transcript"}
                  </button>
                  {summarizationError && <div className="error-message">{summarizationError}</div>}
                  <div className="form-group">
                    <label htmlFor="summary-content">Summary</label>
                    <ReactQuill
                      id="summary-content"
                      ref={quillSummaryRef}
                      value={summaryContent}
                      modules={modules}
                      formats={formats}
                      onChange={setSummaryContent}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button type="submit" className="submit-button">Create Post</button>
    </form>
  );
}
