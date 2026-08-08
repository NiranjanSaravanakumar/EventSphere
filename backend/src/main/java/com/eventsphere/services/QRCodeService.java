package com.eventsphere.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.eventsphere.entities.Registration;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Service
public class QRCodeService {

    private static final int QR_SIZE = 300;

    /**
     * Generates a unique, opaque token for a registration.
     * Format: ES-{registrationId}-{random-hex}
     */
    public String generateToken(Registration registration) {
        String hex = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        return "ES-" + registration.getId() + "-" + hex;
    }

    /**
     * Encodes the given text into a QR code image and returns it
     * as a "data:image/png;base64,..." URI ready for use in <img src="..."/>.
     */
    public String generateQRCodeBase64(String text) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            // Render as white QR on transparent background (black modules on white)
            MatrixToImageConfig config = new MatrixToImageConfig(0xFF000000, 0xFFFFFFFF);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", out, config);

            String base64 = Base64.getEncoder().encodeToString(out.toByteArray());
            return "data:image/png;base64," + base64;
        } catch (Exception e) {
            throw new RuntimeException("QR generation failed for token: " + text, e);
        }
    }
}
