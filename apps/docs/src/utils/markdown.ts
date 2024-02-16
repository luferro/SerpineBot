import parser from "html-react-parser";
import { marked } from "marked";

export function parse(string: string) {
	return parser(marked.parse(string) as string);
}
