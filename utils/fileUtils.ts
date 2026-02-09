
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the prefix e.g. "data:video/mp4;base64,"
      resolve(result.substring(result.indexOf(',') + 1));
    };
    reader.onerror = (error) => reject(error);
  });
