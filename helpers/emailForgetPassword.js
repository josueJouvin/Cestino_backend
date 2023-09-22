import nodemailer from "nodemailer"
import { Resend } from 'resend';


const emailForgetPassword = async ({email, name, token}) =>{
  /*
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }); 
      
      const info = await transport.sendMail({
        from: "Cestino - Administra tus productos",
        to: email,
        subject: "Reestablece tu Password",
        text: "Reestablece tu Password",
        html: `<p>Hola: ${name}, has solicitado reestablecer tu password.</p>
               <p>Ingresa al siguiente enlace para generar un nuevo password: <a href="${process.env.FRONTEND_URL}/auth/olvide-password/${token}">Reestablece tu password</a></p>
               
               <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      })
      console.log("enviado: %s", info.messageId)
      
      */

      const resend = new Resend(process.env.EMAIL_API_KEY);

      try {
        const data = await resend.emails.send({
          from: 'Cestino - Administra tus productos <onboarding@resend.dev>',
          to: email,
          subject: 'Reestablece tu Password',
          text: "Reestablece tu Password",
          html: `<p>Hola: ${name}, has solicitado reestablecer tu password.</p>
              <p>Ingresa al siguiente enlace para generar un nuevo password: <a href="${process.env.FRONTEND_URL}/auth/olvide-password/${token}">Reestablece tu password</a></p>
        
              <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
              `
        });
    
        console.log(data);
      } catch (error) {
        console.error(error);
      }
}

export default emailForgetPassword