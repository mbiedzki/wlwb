export const download = async () => {
    const response = await fetch('https://example.com/somefile.txt');
    console.log('ABC res', response);
};
