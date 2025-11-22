export const testConnection = async (url) => {
  try {
    const response = await fetch(url);
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
