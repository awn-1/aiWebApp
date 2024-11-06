export async function sendMessageToClaude(message, conversationId = null) {
    try {
        // Get user profile data from context
        const relationshipData = localStorage.getItem('relationshipFormData');
        let userContext = '';

        if (relationshipData) {
            const parsedData = JSON.parse(relationshipData);
            userContext = `
User Profile Context:
- Relationship Status: ${parsedData.relationshipStatus || 'Not specified'}
- Relationship Patterns: ${parsedData.relationshipPatterns || 'Not specified'}
- Relationship Challenges & Growth Areas: ${parsedData.challengesAndGrowth || 'Not specified'}
`;
        }

        // Prepare the message with context
        const messageWithContext = `
${userContext}

User Message: ${message}
`;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: messageWithContext,
                conversationId,
                // Add any other necessary parameters
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending message to Claude:', error);
        throw error;
    }
}