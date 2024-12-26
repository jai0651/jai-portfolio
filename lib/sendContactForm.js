

export const sendContactForm = async (formData) => {
    try {
      const response = await fetch('/api/sendMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending contact form:', errorData);
        return { success: false, message: errorData.message || 'Failed to send email' };
      }
  
      const result = await response.json();
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Network or server error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };
  