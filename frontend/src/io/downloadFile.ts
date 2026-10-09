// Offer text as a file download, for example the use cases as a MaGMa file ("Save MaGMa YAML").
export function downloadFile(text: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
