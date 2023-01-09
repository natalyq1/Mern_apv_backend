import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;
  //enviar el email
  const info = await transporter.sendMail({
    from: "APV- Administrador de Pacientes de Veterinaria",
    to: email,
    subject: "Reestablece tu contraseña",
    text: "Reestablece tu contraseña",
    html: `
        <p>
        Hola: ${nombre}, has solicitado reestablecer tu contraseña.
        </p>
        <p>
        Sigue el enlace para generar un nuevo password
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">
        Comprobar cuenta
        </a>
        </p>
        <p>
        Si tu no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
        `,
  });

  console.log("Mensaje enviado: %s", info.messageId);
};

export default emailOlvidePassword;
