import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiPencilPlus, mdiLockOpen, mdiLockOpenVariant, mdiTimerPlus, mdiClose, mdiDelete, mdiPen,mdiPenPlus } from "@mdi/js";

function CourseAssessment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    axiosInstance.get(`/Course/${courseId}`)
      .then(res => setCourseTitle(res.data?.title || "Course"))
      .catch(() => setCourseTitle("Course"));
  }, [courseId]);
  
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentTimer, setAssessmentTimer] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [marks, setMarks] = useState('');
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentExists, setAssessmentExists] = useState(false);
  
  // Fetch assessment if it exists
  useEffect(() => {
  axiosInstance.get(`/Assessments/${courseId}`)
    .then(res => {
      if (res.data && res.data.questions) {
        try {
          const parsed = JSON.parse(res.data.questions);
          setAssessmentTitle(parsed.assessmentTitle || "");
          setAssessmentTimer(parsed.assessmentTimer || "");
          setQuestions(parsed.questions || []);
          setJsonInput(JSON.stringify(parsed, null, 2));
          setAssessmentExists(true); // Set existence flag
        } catch (e) {
          setAssessmentExists(false);
        }
      }
    })
    .catch(() => {
      setAssessmentExists(false);
    });
}, [courseId]);

  // Add or update question
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (
      !question.trim() ||
      options.some(opt => !opt.trim()) ||
      correctIndex === null ||
      !marks ||
      isNaN(Number(marks)) ||
      Number(marks) <= 0
    ) {
      alert('Please fill all fields, select the correct option, and enter a valid mark.');
      return;
    }
    if (editingIdx !== null) {
      setQuestions(qs =>
        qs.map((q, idx) =>
          idx === editingIdx
            ? { question, options: [...options], correct: correctIndex, marks: Number(marks) }
            : q
        )
      );
      setEditingIdx(null);
    } else {
      setQuestions(qs => [
        ...qs,
        { question, options: [...options], correct: correctIndex, marks: Number(marks) }
      ]);
    }
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectIndex(null);
    setMarks('');
  };

  const handleEditAssessment = () => {
  if (!assessmentTitle.trim() || !assessmentTimer || questions.length === 0) {
    alert("Please fill assessment title, timer, and add at least one question.");
    return;
  }
  setIsSubmitting(true);
  axiosInstance.put(`/Assessments/${courseId}/UpdateAssessment`, {
    title: assessmentTitle,
    questions: JSON.stringify({
      assessmentTitle,
      assessmentTimer,
      maxScore,
      questions
    })
  })
    .then(() => {
      alert("Assessment updated successfully!");
      navigate(-1);
    })
    .catch(() => alert("Failed to update assessment."))
    .finally(() => setIsSubmitting(false));
};

  const handleDeleteQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    if (editingIdx === idx) {
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectIndex(null);
      setMarks('');
      setEditingIdx(null);
    }
  };

  const handleEditQuestion = (idx) => {
    const q = questions[idx];
    setQuestion(q.question);
    setOptions([...q.options]);
    setCorrectIndex(q.correct);
    setMarks(q.marks);
    setEditingIdx(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setJsonInput(JSON.stringify({
      assessmentTitle,
      assessmentTimer,
      maxScore: questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0),
      questions
    }, null, 2));
  }, [questions, assessmentTitle, assessmentTimer]);

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      if (parsed && Array.isArray(parsed.questions)) {
        setAssessmentTitle(parsed.assessmentTitle || '');
        setAssessmentTimer(parsed.assessmentTimer || '');
        setQuestions(parsed.questions);
        setEditingIdx(null);
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectIndex(null);
        setMarks('');
      }
    } catch (error) {
      // Invalid JSON, don't update questions
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase()) ||
    q.options.some(opt => opt.toLowerCase().includes(search.toLowerCase()))
  );

  const maxScore = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const filteredMaxScore = filteredQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  // SUBMIT ASSESSMENT TO BACKEND
  const handleCreateAssessment = () => {
    if (!assessmentTitle.trim() || !assessmentTimer || questions.length === 0) {
      alert("Please fill assessment title, timer, and add at least one question.");
      return;
    }
    setIsSubmitting(true);
    axiosInstance.post(`/Assessments/${courseId}/CreateAssessment`, {
      title: assessmentTitle,
      maxscore: maxScore,
      questions: JSON.stringify({
        assessmentTitle,
        assessmentTimer,
        maxScore,
        questions
      })
    })
      .then(() => {
        alert("Assessment created successfully!");
        navigate(-1); // Go back to previous page
      })
      .catch(() => alert("Failed to create assessment."))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="container mt-4">
      {/* Back and Create Assessment Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <Icon path={mdiArrowLeft} size={0.9} /> Back
        </button>
      </div>

      <h2 className="mb-4">{courseTitle} - Assessment Builder</h2>

      {/* Assessment Title, Timer, Max Score */}
      <div className="row mb-4 align-items-end">
        <div className="col-md-6 mb-2">
          <label className="form-label fw-bold" style={{ fontSize: '0.95rem' }}>
            Assessment Title
          </label>
          <input
            type="text"
            className="form-control"
            value={assessmentTitle}
            onChange={e => setAssessmentTitle(e.target.value)}
            placeholder="Enter assessment title"
            required
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label fw-bold" style={{ fontSize: '0.95rem' }}>
            Timer (minutes)
          </label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={assessmentTimer}
            onChange={e => setAssessmentTimer(e.target.value)}
            placeholder="Time limit in minutes"
            required
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <span className="badge rounded-pill bg-success" style={{ fontSize: '0.8rem' }}>
            Max Score: {maxScore}
          </span><p>&nbsp;&nbsp;</p>
          <span className="badge rounded-pill bg-primary" style={{ fontSize: '0.8rem' }}>
            Total Questions: {questions.length}
          </span>
        </div>
      </div>

      {/* Assessment Form */}
      <form onSubmit={handleAddQuestion} className="mb-4 p-3 border rounded">
        <div className="mb-3">
          <label className="form-label fw-bold" style={{ fontSize: '0.95rem' }}>
            Question
          </label>
          <input
            type="text"
            className="form-control"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Enter your question"
            required
          />
        </div>
        <div className="mb-2 fw-bold" style={{ fontSize: '0.95rem' }}>
          Options (select the correct one):
        </div>
        {options.map((opt, idx) => (
          <div key={idx} className="input-group mb-2">
            <div className="input-group-text">
              <input
                type="radio"
                name="correctOption"
                checked={correctIndex === idx}
                onChange={() => setCorrectIndex(idx)}
                required
                aria-label={`Mark option ${idx + 1} as correct`}
              />
            </div>
            <input
              type="text"
              className="form-control"
              value={opt}
              onChange={e =>
                setOptions(opts => opts.map((o, i) => (i === idx ? e.target.value : o)))
              }
              placeholder={`Option ${idx + 1}`}
              required
            />
          </div>
        ))}
        <div className="mb-3">
          <label className="form-label fw-bold" style={{ fontSize: '0.95rem' }}>
            Marks for this question
          </label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={marks}
            onChange={e => setMarks(e.target.value)}
            placeholder="Marks"
            required
          />
        </div>
        <div className="d-flex justify-content-between gap-2 mt-3">
          <div>
            <button type="submit" className="btn btn-success">
              <Icon path={mdiPencilPlus} size={0.9} />
              {editingIdx !== null ? "Update Question" : "Add Question"}
            </button>{" "}
            {editingIdx !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingIdx(null);
                  setQuestion('');
                  setOptions(['', '', '', '']);
                  setCorrectIndex(null);
                  setMarks('');
                }}
              >
                <Icon path={mdiClose} size={0.9} /> Cancel Edit
              </button>
            )}
          </div>
          <div>
           <button
                type="button"
                className={assessmentExists ? "btn btn-primary" : "btn btn-success"}
                onClick={assessmentExists ? handleEditAssessment : handleCreateAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    {assessmentExists ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Icon path={mdiTimerPlus} size={0.9} />
                    {assessmentExists ? "Edit Assessment" : "Create Assessment"}
                  </>
                )}
              </button>
          </div>
        </div>
      </form>

      {/* JSON Editor */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold" style={{ fontSize: '0.95rem' }}>
            Assessment JSON (for storage):
          </label>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setEditMode(!editMode)}
          >
            <Icon
              path={editMode ? mdiLockOpenVariant : mdiLockOpen}
              size={0.8}
              style={{ marginRight: 6, verticalAlign: 'middle' }}
            />
            {editMode ? "Lock Editing" : "Enable JSON Editing"}
          </button>
        </div>
        <textarea
          className="form-control font-monospace"
          rows={Math.max(4, questions.length * 3)}
          value={jsonInput}
          onChange={handleJsonChange}
          readOnly={!editMode}
          style={{
            backgroundColor: editMode ? "#fff" : "#f8f9fa",
            cursor: editMode ? "text" : "not-allowed"
          }}
        />
      </div>

      {/* Search Bar and Pills */}
      <div className="mb-3 row align-items-center">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search questions or options..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex flex-column align-items-end">
          <span className="badge rounded-pill text-bg-primary" style={{ fontSize: '0.8rem' }}>
            Total Questions: {filteredQuestions.length}
          </span><p></p>
          <span className="badge rounded-pill bg-success" style={{ fontSize: '0.8rem' }}>
            Max Score: {filteredMaxScore}
          </span>
        </div>
      </div>

      {/* Questions List */}
      <h5 className="mb-3">Questions ({filteredQuestions.length})</h5>
      {filteredQuestions.length === 0 ? (
        <div className="text-muted" style={{marginBottom:"5rem"}}>No questions found.</div>
      ) : (
        <ol>
          {filteredQuestions.map((q, idx) => (
            <li key={idx} className="mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>Q{idx + 1}:</strong> {q.question}
                  <ul style={{ listStyleType: 'lower-alpha' }}>
                    {q.options.map((opt, oidx) => (
                      <li
                        key={oidx}
                        style={{
                          fontWeight: oidx === q.correct ? 'bold' : 'normal',
                          color: oidx === q.correct ? '#198754' : undefined
                        }}
                      >
                        {opt} {oidx === q.correct && <span className="badge bg-success ms-2">Correct</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="text-muted small">
                    Marks: {q.marks}
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditQuestion(idx)}
                  > <Icon path={mdiPen} size={0.6} />
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteQuestion(idx)}
                  > <Icon path={mdiDelete} size={0.6} />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default CourseAssessment;
