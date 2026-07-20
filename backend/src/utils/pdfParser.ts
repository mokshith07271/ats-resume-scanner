import pdf from 'pdf-parse';

export const parsePDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF file');
  }
};
