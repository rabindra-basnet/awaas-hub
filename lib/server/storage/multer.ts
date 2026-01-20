// import multer from "multer";
// import path from "path";
// import fs from "fs";

// export const getMulter = (visibility: "public" | "private") => {
//   const uploadDir = path.join(process.cwd(), "storage", visibility);

//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: uploadDir,
//     filename: (_req, file, cb) => {
//       const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, `${unique}-${file.originalname}`);
//     },
//   });

//   return multer({ storage });
// };

// lib/multer.ts
import multer from "multer";
import fs from "fs";
import path from "path";

export const getMulter = (isPrivate: boolean) => {
  const dir = path.join(
    process.cwd(),
    "storage",
    isPrivate ? "private" : "public",
  );
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: dir,
      filename: (_req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
      },
    }),
  });
};
