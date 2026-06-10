import React from "react";

const RAZON_SOCIAL = "Jorge Gomez Fuentes";
const DOMICILIO   = "Calle Puerto Mazatlán 4233, Colonia Las Brisas 4to Sector, Monterrey, Nuevo León, C.P. 64790, México";
const EMAIL_ARCO  = "pequesauriosmx@gmail.com";

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="font-heading font-bold text-lg text-foreground mb-3">
      {num}. {title}
    </h2>
    <div className="space-y-3 text-sm text-foreground/70 leading-relaxed">{children}</div>
  </div>
);

export default function AvisoPrivacidad() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <p className="font-script text-2xl text-primary mb-2">legal</p>
      <h1 className="font-display text-4xl font-bold text-foreground mb-2">Aviso de Privacidad</h1>
      <p className="text-sm text-muted-foreground mb-10">Última actualización: {new Date().getFullYear()}</p>

      <div className="prose-sm max-w-none">

        <p className="text-sm text-foreground/70 leading-relaxed mb-8">
          <strong>Pequesaurios</strong> es un negocio dedicado a la renta de mobiliario infantil,
          inflables y artículos recreativos para fiestas y eventos en Monterrey y área metropolitana.
          El responsable del tratamiento de los Datos Personales es <strong>{RAZON_SOCIAL}</strong>,
          persona física que opera bajo el nombre comercial <strong>Pequesaurios</strong>, con domicilio
          en {DOMICILIO} (en adelante <strong>"Pequesaurios"</strong> o el <strong>"Responsable"</strong>).
        </p>
        <p className="text-sm text-foreground/70 leading-relaxed mb-8">
          En este Aviso de Privacidad se indica el tipo de Datos que se recopilan, el perfil de las
          personas físicas a quienes pertenecen, así como el tratamiento y la finalidad para los cuales
          fueron o son obtenidos, en cumplimiento de la Ley Federal de Protección de Datos Personales
          en Posesión de los Particulares (LFPDPPP).
        </p>

        <Section num="1" title="Datos recabados">
          <p>
            Pequesaurios recaba los Datos de los <strong>CLIENTES</strong> en forma directa o personal,
            en atención a lo siguiente:
          </p>
          <p>
            <strong>(i)</strong> Nombre completo, teléfono móvil, correo electrónico y dirección del
            evento, con la finalidad de identificar al cliente, coordinar la entrega e instalación del
            equipo rentado y dar seguimiento a la reservación.
          </p>
          <p>
            <strong>(ii)</strong> Retrato físico (mediante fotografía o video) del cliente y/o de los
            menores presentes en el evento, para propósitos de seguridad y, previa autorización expresa,
            para publicidad y promoción de Pequesaurios en redes sociales u otros medios.
          </p>
          <p>
            <strong>(iii)</strong> Datos de pago (referencia de transferencia, número de orden), con el
            propósito de confirmar el anticipo y el saldo correspondiente al servicio contratado.
            Pequesaurios <strong>no almacena</strong> números de tarjeta ni datos bancarios completos.
          </p>
          <p>
            En caso de que el cliente actúe en nombre de un menor de edad, acepta expresamente contar
            con todas las facultades legales (patria potestad, tutela u otra figura equivalente) para
            aceptar los presentes términos en representación del menor.
          </p>
        </Section>

        <Section num="2" title="Medidas de seguridad">
          <p>
            Pequesaurios implementará y mantendrá acciones y mecanismos de protección adecuados,
            consistentes en medidas administrativas, físicas y técnicas, con el propósito de garantizar
            la seguridad, integridad y privacidad de los Datos recabados.
          </p>
        </Section>

        <Section num="3" title="Derechos ARCO">
          <p>
            El Titular podrá en todo momento ejercer sus derechos de <strong>Acceso, Rectificación,
            Cancelación u Oposición (ARCO)</strong> respecto de sus Datos, mediante solicitud escrita
            dirigida a Pequesaurios al siguiente correo electrónico:
          </p>
          <p>
            <a href={`mailto:${EMAIL_ARCO}`} className="text-primary font-semibold hover:underline">
              {EMAIL_ARCO}
            </a>
          </p>
          <p>
            La solicitud deberá incluir: nombre completo del Titular, descripción clara del derecho que
            desea ejercer y los Datos sobre los que solicita la acción. Pequesaurios dará respuesta en
            un plazo no mayor a 20 días hábiles.
          </p>
          <p>
            A través del mismo correo, el Titular podrá manifestar su negativa al tratamiento y/o
            transferencia de sus Datos, revocar el consentimiento otorgado, o solicitar la limitación
            al uso o divulgación de los mismos.
          </p>
        </Section>

        <Section num="4" title="Transferencia de datos">
          <p>
            Pequesaurios podrá ceder y/o transferir los Datos a personas físicas o morales con las que
            mantiene relaciones comerciales, con la finalidad de mejorar la prestación del servicio o
            en caso de emergencia médica del Titular o de personas bajo su cuidado. Si el Titular no
            manifiesta expresamente su oposición conforme a lo previsto en este Aviso, se entenderá que
            autoriza dicha cesión.
          </p>
          <p>
            Los terceros receptores quedarán sujetos a lo establecido en el presente Aviso de
            Privacidad.
          </p>
        </Section>

        <Section num="5" title="Cambios al Aviso de Privacidad">
          <p>
            Cualquier modificación al presente Aviso de Privacidad será notificada a través del sitio
            web <strong>pequesaurios.com</strong> o mediante comunicación directa al correo registrado
            por el Titular.
          </p>
        </Section>

      </div>
    </div>
  );
}
