import React, { useState } from 'react';
import './Feedback.css'

const FeedbackForm = ({ onLoading }) => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      try{
        setLoading(true)
        onLoading(true)
        // You can send this data to your backend or do anything else with it
        fetch(`${process.env.REACT_APP_BACKEDN_URL}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback }),
        })
        
      }catch(e) {
        console.error(e)
      }finally{
        setSubmitted(true);
        setLoading(false)
        onLoading(false)
      }

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
            <button disabled={loading} type="submit">Submit</button>
          </form>
        )}
        {submitted && <p className="feedback-message">Thanks for the feedback!</p>}
      </div>
    );
  };

export default FeedbackForm;
