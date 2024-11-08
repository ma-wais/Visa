import { connectToDatabase } from "@/utils/db";
import Visa from "@/models/visa";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export async function POST(req) {
  const {
    visaNumber,
    visaTypeArabic,
    visaTypeEnglish,
    visaPurposeArabic,
    visaPurposeEnglish,
    dateOfIssue,
    dateOfExpiry,
    fullNameArabic,
    fullNameEnglish,
    placeOfIssueArabic,
    moiReference,
    nationality,
    gender,
    occupationArabic,
    occupationEnglish,
    dob,
    passportNo,
    passportExpiry,
    entryDate,
    departureDate,
    moreDetails,
  } = await req.json();

  const { db } = await connectToDatabase();

  try {
    const existingVisa = await Visa.findOne({ visaNumber });
    const existingPassport = await Visa.findOne({ passportNo });

    if (existingVisa) {
      return new Response(
        JSON.stringify({ message: "Visa Number must be unique" }),
        { status: 400 }
      );
    }
    if (existingPassport) {
      return new Response(
        JSON.stringify({ message: "Passport Number must be unique" }),
        { status: 400 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 950]);

    const qrData = JSON.stringify({ visaNumber, fullNameEnglish, passportNo });
    const qrCodeImage = await QRCode.toBuffer(qrData);
    const qrCodeImageEmbed = await pdfDoc.embedPng(qrCodeImage);
    const qrCodeSize = 70;

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.Helvetica, {
      subtype: "Bold",
    });

    const styles = {
      titleSize: 16,
      normalSize: 12,
      smallSize: 10,
      primaryColor: rgb(0.016, 0.29, 0.584),
      secondaryColor: rgb(0.2, 0.506, 0.827),
      textColor: rgb(0.231, 0.231, 0.231),
      backgroundColor: rgb(0.925, 0.933, 0.941),
      borderColor: rgb(0, 0, 0),
    };

    const headerHeight = 100;
    const backgroundPath = path.join(
      process.cwd(),
      "public",
      "images",
      "pdf-background.jpg"
    );
    const backgroundImage = await pdfDoc.embedJpg(
      fs.readFileSync(backgroundPath)
    );
    page.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      opacity: 1,
    });
    const flagPath = path.join(process.cwd(), 'public', 'images', 'flag.png');
    const flagImage = await pdfDoc.embedPng(fs.readFileSync(flagPath));
    const flagWidth = 70; 
    const flagHeight = (flagWidth * flagImage.height) / flagImage.width;

    const middleFlagWidth = 100; 
    const middleFlagHeight = (middleFlagWidth * flagImage.height) / flagImage.width; 

    // page.drawImage(flagImage, {
    //   x: (page.getWidth() - middleFlagWidth) / 2 + middleFlagWidth + 10, 
    //   y: page.getHeight() - flagHeight - 20,
    //   width: flagWidth,
    //   height: flagHeight,
    //   opacity: 0.3,
    // });

    // page.drawImage(flagImage, {
    //   x: (page.getWidth() - middleFlagWidth) / 2, 
    //   y: page.getHeight() - middleFlagHeight - 20,
    //   width: middleFlagWidth,
    //   height: middleFlagHeight,
    //   opacity: 0.3,
    // });

    // page.drawImage(flagImage, {
    //   x: (page.getWidth() - middleFlagWidth) / 2 - flagWidth - 10, 
    //   y: page.getHeight() - flagHeight - 20,
    //   width: flagWidth,
    //   height: flagHeight,
    //   opacity: 0.3,
    // });

    // page.drawImage(qrCodeImageEmbed, {
    //   x: page.getWidth() - qrCodeSize - 30,
    //   y: 30,
    //   width: qrCodeSize - 10,
    //   height: qrCodeSize - 10,
    // });
    // page.drawImage(flagImage, {
    //   x: page.getWidth() - qrCodeSize - 60,
    //   y: page.getHeight() - qrCodeSize - 70,

    //   width: middleFlagWidth,
    //   height: middleFlagHeight,
    //   opacity: 1,
    // });
    // const titleText = "Electronic Visa";

    // const titleWidth = helveticaBold.widthOfTextAtSize(
    //   titleText,
    //   styles.titleSize
    // );

    page.drawImage(qrCodeImageEmbed, {
      x: 30,
      y: page.getHeight() - qrCodeSize - 40,
      width: qrCodeSize,
      height: qrCodeSize,
    });
    // page.drawText(titleText, {
    //   x: (page.getWidth() - titleWidth) / 2,
    //   y: page.getHeight() - 60,
    //   size: styles.titleSize,
    //   font: helveticaBold,
    //   color: styles.primaryColor,
    // });

    // Flag in header
    // const flagPath = path.join(process.cwd(), "public", "images", "flag.png");
    // const flagImage = await pdfDoc.embedPng(fs.readFileSync(flagPath));
    // page.drawImage(flagImage, {
    //   x: page.getWidth() - 110,
    //   y: page.getHeight() - 110,
    //   width: 70,
    //   height: 70 * (flagImage.height / flagImage.width),
    //   opacity: 0.3,
    // });

    // Content sections
    let yPosition = page.getHeight() - headerHeight - 47;

    // page.drawLine({
    //   start: { x: 20, y: yPosition },
    //   end: { x: page.getWidth() - 20, y: yPosition },
    //   thickness: 2,
    //   color: rgb(0, 0, 0),
    // });

    // yPosition = page.getHeight() - headerHeight - 60;

    const drawSectionHeader = (text, arabicText, y) => {
      // page.drawText(text, {
      //   x: 40,
      //   y,
      //   size: styles.normalSize,
      //   font: helveticaBold,
      //   color: styles.secondaryColor,
      // });
      // page.drawText(arabicText, {
      //   x:
      //     page.getWidth() -
      //     40 -
      //     helveticaFont.widthOfTextAtSize(arabicText, styles.normalSize),
      //   y,
      //   size: styles.normalSize,
      //   font: helveticaFont,
      //   color: styles.secondaryColor,
      // });
      return y - 30;
    };

    const drawDetailRow = (label, value, y) => {
      // page.drawRectangle({
      //   x: 40,
      //   y: y - 20,
      //   width: page.getWidth() - 80,
      //   height: 28,
      //   color: styles.backgroundColor,
      // });

      // page.drawText(label, {
      //   x: 50,
      //   y: y - 10,
      //   size: styles.smallSize,
      //   font: helveticaFont,
      //   color: styles.textColor,
      // });

      page.drawText(String(value), {
        x:
          page.getWidth() / 2 -
          helveticaFont.widthOfTextAtSize(String(value), styles.smallSize),
        y: y - 10,
        size: styles.smallSize,
        font: helveticaBold,
        color: styles.textColor,
      });

      return y - 30;
    };

    yPosition = drawSectionHeader("Visa Details", "", yPosition);
    yPosition = drawDetailRow("Visa Number:", visaNumber, yPosition);
    yPosition = drawDetailRow(
      "Visa Type (Arabic):",
      visaTypeEnglish,
      yPosition
    );
    yPosition -= 5;
    yPosition = drawDetailRow(
      "Visa Purpose (Arabic):",
      visaPurposeEnglish,
      yPosition
    );
    yPosition -= 5;
    yPosition = drawDetailRow(
      "Date of Issue:",
      formatDate(dateOfIssue),
      yPosition
    );
    yPosition += 7;
    yPosition = drawDetailRow(
      "Date of Expiry:",
      formatDate(dateOfExpiry),
      yPosition
    );
    yPosition += 3;
    yPosition = drawDetailRow(
      "Place of Issue (Arabic):",
      placeOfIssueArabic,
      yPosition
    );

    yPosition -= 29;
    yPosition = drawDetailRow(
      "Full Name (English):",
      fullNameEnglish,
      yPosition
    );
    yPosition -= 5;
    yPosition = drawDetailRow("Moi Reference:", moiReference, yPosition);
    yPosition += 5;

    yPosition = drawDetailRow("Nationality:", nationality, yPosition);
    yPosition += 5;

    yPosition = drawDetailRow("Gender:", gender, yPosition);
    yPosition += 8;
    yPosition = drawDetailRow(
      "Occupation (Arabic):",
      occupationEnglish,
      yPosition
    );
    yPosition += 10;

    yPosition = drawDetailRow("Date of Birth:", formatDate(dob), yPosition);
    yPosition += 2;
    yPosition = drawDetailRow("Passport Number:", passportNo, yPosition);
    yPosition += 7;
    yPosition = drawDetailRow(
      "Place of Issue (Arabic):",
      placeOfIssueArabic,
      yPosition
    );

    yPosition -= 10;
    yPosition = drawDetailRow(
      "Passport Expiry:",
      formatDate(passportExpiry),
      yPosition
    );
    yPosition -= 52;

    yPosition = drawDetailRow("MOI Reference:", moiReference, yPosition);
    yPosition += 8;

    yPosition = drawDetailRow("Entry Date:", formatDate(entryDate), yPosition);
    yPosition += 6;
    yPosition = drawDetailRow(
      "Departure Date:",
      formatDate(departureDate),
      yPosition
    );

    if (moreDetails) {
      yPosition -= 20;
      page.drawText("Additional Details:", {
        x: 40,
        y: yPosition,
        size: styles.normalSize,
        font: helveticaBold,
        color: styles.textColor,
      });
      yPosition -= 20;

      const words = moreDetails.split(" ");
      let line = "";
      const maxWidth = page.getWidth() - 100;

      for (const word of words) {
        const testLine = line + word + " ";
        const width = helveticaFont.widthOfTextAtSize(
          testLine,
          styles.smallSize
        );

        if (width > maxWidth) {
          page.drawText(line, {
            x: 40,
            y: yPosition,
            size: styles.smallSize,
            font: helveticaFont,
            color: styles.textColor,
          });
          yPosition -= 20;
          line = word + " ";
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, {
          x: 40,
          y: yPosition,
          size: styles.smallSize,
          font: helveticaFont,
          color: styles.textColor,
        });
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const pdfPath = `/tmp/${visaNumber}.pdf`;
    fs.writeFileSync(pdfPath, pdfBytes);

    const visa = new Visa({
      visaNumber,
      visaTypeArabic,
      visaTypeEnglish,
      visaPurposeArabic,
      visaPurposeEnglish,
      dateOfIssue,
      dateOfExpiry,
      placeOfIssueArabic,
      fullNameArabic,
      fullNameEnglish,
      moiReference,
      nationality,
      gender,
      occupationArabic,
      occupationEnglish,
      dob,
      passportNo,
      passportExpiry,
      entryDate,
      departureDate,
      moreDetails,
      pdfPath,
    });
    await visa.save();

    return new Response(
      JSON.stringify({
        message: "Visa data saved successfully and PDF generated!",
        pdfPath,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred while processing the visa:", error);
    return new Response(
      JSON.stringify({
        message: "An error occurred while processing the request.",
      }),
      { status: 500 }
    );
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
// const footerHeight = 90;
    // page.drawRectangle({
    //   x: 22,
    //   y: 22,
    //   width: page.getWidth() - 44,
    //   height: footerHeight,
    //   color: styles.backgroundColor,
    // });

    // const qrData = JSON.stringify({ visaNumber, fullNameEnglish, passportNo });
    // const qrCodeImage = await QRCode.toBuffer(qrData);
    // const qrCodeImageEmbed = await pdfDoc.embedPng(qrCodeImage);
    // page.drawImage(qrCodeImageEmbed, {
    //   x: 30,
    //   y: 25,
    //   width: 70,
    //   height: 70,
    // });

    // page.drawImage(flagImage, {
    //   x: page.getWidth() - 100,
    //   y: 25,
    //   width: 70,
    //   height: 70 * (flagImage.height / flagImage.width),
    // });

    // page.drawText("No signature is required.", {
    //   x: (page.getWidth() - helveticaFont.widthOfTextAtSize("No signature is required.", styles.smallSize)) / 2,
    //   y: 45,
    //   size: styles.smallSize,
    //   font: helveticaFont,
    //   color: styles.secondaryColor,
    // });
