const utfDecoder = new TextDecoder("utf-8");
export default async function readFileString(path: string) {
  const fileBuffer = await Deno.open(path).then(file => Deno.readAll(file));
  return utfDecoder.decode(fileBuffer);
}

export async function readFileLines(path: string){
    const stringResult = await readFileString(path);
    return stringResult.split("\n");
} 
