import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
export function CopyButton({ text }: { text: string }) {
  const [_, copy] = useCopyToClipboard();
  const handleCopy = async (text: string) => {
    await copy(text)
      .then(() => {
        console.log("Copied!", { text });
        toast.success("Copied!");
      })
      .catch((error) => {
        console.error("Failed to copy!", error);
        toast.error("Failed to copy!");
      });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        await handleCopy(text);
      }}
      className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm"
    >
      <CopyIcon className="h-4 w-4 mr-1" />
      Copy
    </Button>
  );
}
function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}
