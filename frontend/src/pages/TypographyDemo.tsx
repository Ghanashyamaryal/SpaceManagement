import { Typography } from "@Components/index"

export default function TypographyDemo() {
  return (
    <div className="p-6 space-y-4">
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>

      <Typography>
        This is a responsive paragraph.
      </Typography>

      <Typography variant="h1" className="text-red-500">
        Red Heading
      </Typography>

      <Typography
        variant="h1"
        className="text-[0.875rem] sm:text-[0.875rem] md:text-[0.875rem] lg:text-[0.875rem]"
      >
        Small Override
      </Typography>
    </div>
  )
}