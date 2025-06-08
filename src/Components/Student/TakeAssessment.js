import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Icon from "@mdi/react";
import { mdiTimerOutline, mdiCheck, mdiClose, mdiClipboardAlertOutline, mdiTrophy } from "@mdi/js";

function TakeAssessment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [totalTime, setTotalTime] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [noAssessment, setNoAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [summary, setSummary] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    totalMarks: 0
  });
  // For option feedback animation
  const [optionFeedback, setOptionFeedback] = useState({}); // { [questionIndex]: { idx, correct } }
useEffect(() => {
  const disable = (e) => { e.preventDefault(); return false; };
  document.addEventListener("copy", disable);
  document.addEventListener("cut", disable);
  document.addEventListener("paste", disable);
  document.addEventListener("contextmenu", disable);
  document.addEventListener("selectstart", disable);

  return () => {
    document.removeEventListener("copy", disable);
    document.removeEventListener("cut", disable);
    document.removeEventListener("paste", disable);
    document.removeEventListener("contextmenu", disable);
    document.removeEventListener("selectstart", disable);
  };
}, []);
  useEffect(() => {
    axiosInstance.get(`/Assessments/${courseId}`)
      .then(res => {
        if (!res.data || !res.data.questions) {

          setNoAssessment(true);
          setLoading(false);
          return;
        }
        const assessmentData = JSON.parse(res.data.questions);
        if (
          !assessmentData.questions ||
          !Array.isArray(assessmentData.questions) ||
          assessmentData.questions.length === 0
        ) {
          setNoAssessment(true);
          setLoading(false);
          return;
        }
        setAssessmentId(res.data.assessmentId);
        setQuestions(assessmentData.questions);
        setTimer(parseInt(assessmentData.assessmentTimer, 10) * 60);
        setTotalTime(parseInt(assessmentData.assessmentTimer, 10) * 60);
        setAssessmentTitle(res.data.assessmentTitle);
        setLoading(false);
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          setNoAssessment(true);
        } else {
          navigate("/error");
        }
        setLoading(false);
      });
  }, [courseId, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && questions.length > 0) {
      handleAssessmentCompletion();
    }
    // eslint-disable-next-line
  }, [timer, questions.length]);

  useEffect(() => {
    if (
      questions.length > 0 &&
      Object.keys(selectedAnswers).length === questions.length
    ) {
      handleAssessmentCompletion();
    }
    // eslint-disable-next-line
  }, [selectedAnswers, questions.length]);

  const handleAnswerSelect = (optionIndex) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;

    const isCorrect = questions[currentQuestionIndex].correct === optionIndex;
    setOptionFeedback({ [currentQuestionIndex]: { idx: optionIndex, correct: isCorrect } });

     try {
          axiosInstance.post('/AssessmentEvents/QuestionAnswered', {
            assessmentId: assessmentId,
            courseId: courseId,
            questionIndex: currentQuestionIndex,
            selectedOption: optionIndex,
            isCorrect: isCorrect,
            questionMarks: questions[currentQuestionIndex].marks,
            timestamp: new Date().toISOString()
          }).catch(error => {
                  if (error.response) {
                    console.error('Backend error:', error.response.data);
                  } else {
                    console.error('Unknown error:', error);
                  }
                });
        console.log('Question answered event sent successfully');
        } catch (error) {
          console.error('Failed to send question answered event:', error);
        }


    setTimeout(() => {
      setOptionFeedback({});
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: optionIndex
      }));

      if (isCorrect) {
        setScore(prev => prev + questions[currentQuestionIndex].marks);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 500);
  };

  // Calculate summary and show it
  const handleAssessmentCompletion = () => {
    if (showSummary) return; // Prevent double summary

    let correct = 0, incorrect = 0, totalMarks = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        correct++;
        totalMarks += q.marks;
      } else {
        incorrect++;
      }
    });

     // Send completion event
      try {
        axiosInstance.post('/AssessmentEvents/AssessmentCompleted', {
          assessmentId: assessmentId,
          courseId: courseId,
          totalQuestions: questions.length,
          correctAnswers: correct,
          score: score,
          maxScore: questions.reduce((sum, q) => sum + q.marks, 0),
          completionTime: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to send assessment completed event:', error);
      }

    setSummary({
      correct,
      incorrect,
      total: questions.length,
      totalMarks: score // Already calculated along the way
    });

    
    axiosInstance.post(`/${assessmentId}/SubmitAssessment`, {
      score,  
      answers: selectedAnswers
    }).catch(() => {});

    setShowSummary(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (noAssessment) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="card shadow-lg border-0 p-4 text-center" style={{ maxWidth: 400, background: "linear-gradient(135deg, #f8fafc, #e0e7ef 90%)" }}>
          <Icon path={mdiClipboardAlertOutline} size={3} color="#6c63ff" className="mb-3" />
          <h3 className="mb-2" style={{ color: "#333" }}>No Assessment Yet</h3>
          <p className="mb-0" style={{ color: "#555" }}>
            There is currently <b>no assessment</b> for this course.<br />
            Please check back later!
          </p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="card shadow-lg border-0 p-4 text-center" style={{ maxWidth: 400, background: "linear-gradient(135deg, #f8fafc, #e0e7ef 90%)" }}>
          {/* Centered Trophy Icon */}
          <div className="d-flex justify-content-center">
            <Icon path={mdiTrophy} size={3} color="#ffb300" className="mb-3" />
          </div>
          <h3 className="mb-2" style={{ color: "#333" }}>Assessment Completed!</h3>
          {/* Large, bold assessment title */}
          <h2 className="mb-3 fw-bold" style={{ color: "#4b3cff", fontSize: "2rem" }}>{assessmentTitle}</h2>
          <div className="mb-3" style={{ color: "#555" }}>
            <div className="mt-3">
              <span className="badge bg-success me-2" style={{ fontSize: "1rem" }}>
                Correct: {summary.correct}
              </span>
              <span className="badge bg-danger me-2" style={{ fontSize: "1rem" }}>
                Incorrect: {summary.incorrect}
              </span>
              <span className="badge bg-primary" style={{ fontSize: "1rem" }}>
                Total Marks: {summary.totalMarks}
              </span>
            </div>
            <div className="mt-3 text-muted">
              You answered {summary.correct} out of {summary.total} questions correctly.
            </div>
          </div>
          <button className="btn btn-outline-primary mt-2" onClick={() => navigate(-1)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div  onCopy={e => e.preventDefault()}
  onCut={e => e.preventDefault()}
  onPaste={e => e.preventDefault()}
  onContextMenu={e => e.preventDefault()}
  onSelectStart={e => e.preventDefault()}>
    <div className="container mt-4 position-relative" style={{ maxWidth: 650 }}>
      {/* Timer */}
      <div className="position-absolute top-0 end-0 mt-3 me-3 d-flex align-items-center">
        <div className={`btn btn-outline-${timer <= totalTime * 0.2 ? "danger" : "secondary"}`}>
            <Icon path={mdiTimerOutline} size={1} className="me-2" />
            <span className="fw-bold">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </span>
        </div>
        </div>

      {/* Assessment Title */}
      <h2 className="text-center mb-4">{assessmentTitle}</h2>

      {/* Animated Progress Bar */}
      <div className="progress mb-4" style={{ height: "25px" }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{
            width: `${progress}%`,
            transition: "width 0.6s cubic-bezier(.4,2,.6,1)"
          }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-lg mb-3">
        <div className="card-body">
          <h4 className="card-title mb-4 d-flex justify-content-between align-items-center">
            <span>{currentQuestion.question}</span>
            <span className="badge bg-primary ms-2">
              Marks: {currentQuestion.marks}
            </span>
          </h4>
          <div className="list-group gap-2">
            {currentQuestion.options.map((option, idx) => {
              // Determine if this option should get feedback color
              let optionClass = "list-group-item list-group-item-action position-relative";
              const feedback = optionFeedback[currentQuestionIndex];
              if (
                feedback &&
                feedback.idx === idx
              ) {
                optionClass += feedback.correct
                  ? " bg-success text-white"
                  : " bg-danger text-white";
              } else if (
                selectedAnswers[currentQuestionIndex] === idx
              ) {
                // After feedback, show persistent correct/incorrect coloring
                optionClass += idx === currentQuestion.correct
                  ? " bg-success text-white"
                  : " bg-danger text-white";
              }

              if (selectedAnswers[currentQuestionIndex] !== undefined) {
                optionClass += " disabled";
              }

              return (
                <button
                  key={idx}
                  className={optionClass}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={selectedAnswers[currentQuestionIndex] !== undefined}
                >
                  {option}
                  {selectedAnswers[currentQuestionIndex] === idx && (
                    <Icon
                      path={
                        idx === currentQuestion.correct
                          ? mdiCheck
                          : mdiClose
                      }
                      size={0.8}
                      className="position-absolute end-0 me-3"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-4 d-flex justify-content-between align-items-center">
        <div>

        </div>
        <div className="text-muted">
          {Object.keys(selectedAnswers).length} / {questions.length} answered
        </div>
      </div>
    </div>
    </div>
  );
}

export default TakeAssessment;
