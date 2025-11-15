import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { auth } from "@clerk/nextjs/server";

// Prevent this route from being called during build
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize ImageKit inside the function (after build time)
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    // Validate ImageKit credentials
    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error("ImageKit credentials missing:", {
        publicKey: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        privateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
      });
      return NextResponse.json(
        { error: "ImageKit configuration error" },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName =
      fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload";
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedFileName}`;

    // Upload to ImageKit - Simple server-side upload
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: "/projects",
    });

    // Generate thumbnail URL using ImageKit transformations
    const thumbnailUrl = imagekit.url({
      src: uploadResponse.url,
      transformation: [
        {
          width: 400,
          height: 300,
          cropMode: "maintain_ar",
          quality: 80,
        },
      ],
    });

    // Return upload data
    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      thumbnailUrl: thumbnailUrl,
      fileId: uploadResponse.fileId,
      width: uploadResponse.width,
      height: uploadResponse.height,
      size: uploadResponse.size,
      name: uploadResponse.name,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
