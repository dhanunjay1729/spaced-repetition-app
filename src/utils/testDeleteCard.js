import { deleteCard } from '/home/dhanunjay1729/spaced-repetition-app/src/utils/firestore.js';

const testDeleteCard = async () => {
  const testCardId = "XTn5ZEshAdd35XEF2Yeq"; // Replace with a valid card ID from your database

  try {
    console.log(`Attempting to delete card with ID: ${testCardId}`); // Debugging
    await deleteCard(testCardId);
    console.log(`Card with ID: ${testCardId} deleted successfully.`); // Debugging
  } catch (error) {
    console.error(`Failed to delete card with ID: ${testCardId}`, error); // Debugging
  }
};

testDeleteCard();