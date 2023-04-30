import React, { useState } from 'react';
import './Feedback.css'

const FeedbackForm = () => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      // You can send this data to your backend or do anything else with it
      setSubmitted(true);
      fetch(`${process.env.REACT_APP_BACKEDN_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      })
    };
  
    return (
      <div className="feedback-container">
        <h2>Send us some feedback</h2>
        {!submitted && (
          <form className="feedback-form" onSubmit={handleSubmit}>
            <textarea
              id="feedback"
              placeholder="Enter your feedback here"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <br />
            <button type="submit">Submit</button>
          </form>
        )}
        {submitted && <p className="feedback-message">Thanks for the feedback!</p>}
      </div>
    );
  };

export default FeedbackForm;
