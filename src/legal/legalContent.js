// Contenido legal (Términos y Privacidad). PLANTILLA — revisar con un abogado.
// Completá los datos entre corchetes: razón social, correo y fecha de vigencia.
export const LEGAL = {
  platform: "Tito Apps",
  entity: "[Razón social o nombre del titular]",
  email: "[correo de contacto]",
  jurisdiction: "Costa Rica",
  updated: "[fecha de última actualización]",
};

export const TERMS = {
  title: "Términos y Condiciones",
  intro: `Estos Términos y Condiciones regulan el uso de la plataforma ${LEGAL.platform} ("la Plataforma"), operada por ${LEGAL.entity}. Al crear una cuenta o usar la Plataforma, aceptás estos términos.`,
  sections: [
    { h: "1. Descripción del servicio", p: `${LEGAL.platform} es una plataforma para entrenadores personales que permite gestionar clientes, rutinas, ejercicios, mediciones y seguimiento de entrenamientos. Cada entrenador (organización) opera su propio espacio con sus clientes.` },
    { h: "2. Cuentas y acceso", p: "Para usar la Plataforma debés crear una cuenta con un correo válido. Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad de tu cuenta. Hay distintos roles (entrenador/owner, cliente y, para demostraciones, un acceso de solo lectura). No compartas tus credenciales." },
    { h: "3. Uso aceptable", p: "Te comprometés a usar la Plataforma de forma lícita y a no: (a) acceder a datos de otras organizaciones; (b) intentar vulnerar la seguridad o el aislamiento entre cuentas; (c) subir contenido ilegal, ofensivo o que infrinja derechos de terceros; (d) usar la Plataforma para fines distintos al entrenamiento y la gestión de clientes." },
    { h: "4. Suscripción y pagos", p: "El uso de la Plataforma por parte de los entrenadores está sujeto a una suscripción. Los pagos pueden gestionarse de forma manual (SINPE, transferencia u otros medios acordados). La falta de pago puede derivar en la suspensión del acceso operativo. Una cuenta suspendida conserva sus datos; el acceso se restablece al regularizar el pago." },
    { h: "5. Datos y contenido del usuario", p: "El entrenador es responsable de los datos que carga sobre sus clientes y de contar con el consentimiento de ellos. La Plataforma actúa como proveedor de la herramienta. Ver la Política de Privacidad para el detalle del tratamiento de datos." },
    { h: "6. Naturaleza del servicio (no es consejo médico)", p: "La Plataforma es una herramienta de gestión y seguimiento. La información de entrenamiento, rutinas y mediciones no constituye asesoramiento médico. Ante cualquier condición de salud, el usuario debe consultar a un profesional. La responsabilidad del plan de entrenamiento recae en el entrenador, no en la Plataforma." },
    { h: "7. Propiedad intelectual", p: `El software, el diseño y la marca ${LEGAL.platform} son propiedad de ${LEGAL.entity}. El contenido que cada entrenador crea (rutinas, ejercicios, datos de clientes) le pertenece a él y a sus clientes según corresponda.` },
    { h: "8. Disponibilidad y cambios", p: "Hacemos esfuerzos razonables por mantener la Plataforma disponible, pero no garantizamos un servicio ininterrumpido. Podemos actualizar, modificar o discontinuar funciones, avisando cuando sea razonable." },
    { h: "9. Limitación de responsabilidad", p: "En la máxima medida permitida por la ley, la Plataforma se ofrece “tal cual”. No respondemos por daños indirectos, pérdida de datos por causas ajenas a nuestro control, ni por el uso que los entrenadores hagan de la herramienta con sus clientes." },
    { h: "10. Terminación", p: "Podés dejar de usar la Plataforma cuando quieras. Podemos suspender o cancelar cuentas que incumplan estos términos. En caso de cierre de cuenta, se aplicará lo indicado en la Política de Privacidad respecto a la conservación y eliminación de datos." },
    { h: "11. Ley aplicable", p: `Estos términos se rigen por las leyes de ${LEGAL.jurisdiction}. Cualquier controversia se someterá a los tribunales competentes de esa jurisdicción.` },
    { h: "12. Contacto", p: `Para consultas sobre estos términos, escribí a ${LEGAL.email}.` },
  ],
};

export const PRIVACY = {
  title: "Política de Privacidad",
  intro: `Esta Política explica cómo ${LEGAL.entity} ("nosotros"), a través de la plataforma ${LEGAL.platform}, trata los datos personales. Nos tomamos en serio la privacidad, especialmente por tratarse de datos vinculados a la actividad física y la composición corporal.`,
  sections: [
    { h: "1. Responsable del tratamiento", p: `${LEGAL.entity}. Contacto: ${LEGAL.email}.` },
    { h: "2. Qué datos tratamos", p: "Datos de cuenta (nombre, correo, contraseña cifrada). Datos de perfil del cliente (teléfono, cédula, fecha de nacimiento, estatura). Datos de entrenamiento y mediciones (peso, porcentaje de grasa, masa muscular, grasa visceral y similares). Datos de uso técnico (registros de acceso). No solicitamos datos sensibles más allá de los necesarios para el seguimiento físico." },
    { h: "3. Para qué los usamos", p: "Para prestar el servicio: crear y gestionar rutinas, registrar mediciones y entrenamientos, mostrar progreso, y administrar la cuenta y la suscripción. No usamos los datos para publicidad ni los vendemos." },
    { h: "4. Roles: entrenador y plataforma", p: "El entrenador es el responsable de los datos de sus clientes (decide qué carga y con qué fin) y debe contar con el consentimiento de ellos. La Plataforma actúa como encargada del tratamiento: procesa los datos por cuenta del entrenador para brindar la herramienta." },
    { h: "5. Con quién se comparten", p: "Con proveedores de infraestructura necesarios para operar el servicio (por ejemplo, alojamiento y base de datos, despliegue web y envío de correos), bajo acuerdos de confidencialidad y solo en lo necesario. No compartimos datos con terceros para fines comerciales." },
    { h: "6. Seguridad", p: "Aplicamos aislamiento estricto entre organizaciones (cada entrenador ve solo sus datos) mediante seguridad a nivel de fila en la base de datos, autenticación con contraseñas cifradas y control de acceso por roles. Ninguna medida es infalible, pero trabajamos para proteger la información." },
    { h: "7. Conservación", p: "Conservamos los datos mientras la cuenta esté activa. Una cuenta suspendida conserva sus datos hasta que se regularice o se solicite su eliminación. Ante el cierre definitivo, los datos se eliminan o anonimizan en un plazo razonable, salvo obligación legal de conservarlos." },
    { h: "8. Derechos de la persona titular", p: `De acuerdo con la normativa aplicable en ${LEGAL.jurisdiction} (incluida la protección de datos personales), podés solicitar acceso, rectificación, actualización o eliminación de tus datos, así como revocar consentimientos. Escribí a ${LEGAL.email} y atenderemos tu solicitud.` },
    { h: "9. Menores de edad", p: "Si se registran datos de personas menores de edad, debe existir el consentimiento de quien ejerza su representación. El entrenador es responsable de recabar dicho consentimiento." },
    { h: "10. Cambios a esta política", p: "Podemos actualizar esta Política. Publicaremos la versión vigente con su fecha de actualización y, ante cambios relevantes, procuraremos avisar." },
    { h: "11. Contacto", p: `Para ejercer tus derechos o hacer consultas sobre privacidad, escribí a ${LEGAL.email}.` },
  ],
};

export const LEGAL_DOCS = { terms: TERMS, privacy: PRIVACY };
