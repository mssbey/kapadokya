-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Faq_locale_sortOrder_idx" ON "Faq"("locale", "sortOrder");

-- Seed initial content (migrated from the static i18n dictionaries so existing FAQ copy is preserved)
INSERT INTO "Faq" ("id", "locale", "question", "answer", "sortOrder", "isActive", "updatedAt") VALUES
('71ff6a96-1ed8-4eb5-a4de-9567bf119fc4', 'en', 'What happens if my balloon flight is cancelled due to weather?', 'Safety comes first. If the aviation authority cancels the flight, we will help you move to the next available date or process the refund defined by your booking terms.', 0, true, CURRENT_TIMESTAMP),
('680bda67-92ae-46b4-a296-3ec673c3162a', 'en', 'Is hotel pickup included?', 'Pickup is included on tours marked “Hotel pickup included” or “Selected hotels included.” Enter your hotel when booking so our team can confirm coverage.', 1, true, CURRENT_TIMESTAMP),
('2658bc61-7d89-4614-a785-fa009601eeb6', 'en', 'How long is the balloon flight?', 'The complete experience is usually 3–4 hours, including transfers and preparation. Flight duration depends on the package and operating conditions.', 2, true, CURRENT_TIMESTAMP),
('1e8ee8e2-cd20-4200-8be9-e84df192536a', 'en', 'What should I wear?', 'Wear closed shoes and layered clothing. Cappadocia mornings can be cool even during warmer months.', 3, true, CURRENT_TIMESTAMP),
('e86938c8-0bf7-480a-988d-7385543cb88b', 'en', 'Can children fly?', 'Age and height restrictions depend on the operator and current safety rules. Send us the child’s age and height before booking.', 4, true, CURRENT_TIMESTAMP),
('7bc090e1-9990-412e-b9f9-0c16649f0e6d', 'en', 'When will I receive my pickup time?', 'Your exact pickup time is confirmed after booking, normally by the evening before your experience.', 5, true, CURRENT_TIMESTAMP),
('79fc9cc4-15d0-4837-909b-717e60a7a8da', 'tr', 'Balon uçuşum hava koşulları nedeniyle iptal edilirse ne olur?', 'Önce güvenlik. Sivil havacılık otoritesi uçuşu iptal ederse, en yakın uygun tarihe geçmenize yardımcı olur veya rezervasyon koşullarınızda tanımlı iadeyi işleme alırız.', 0, true, CURRENT_TIMESTAMP),
('a1c4590a-442b-4077-a16b-0acec492545d', 'tr', 'Otelden alım dahil mi?', '“Otelden alım dahil” veya “Seçili oteller dahil” yazan turlarda alım dahildir. Ekibimizin kapsamı teyit edebilmesi için rezervasyon sırasında otelinizi girin.', 1, true, CURRENT_TIMESTAMP),
('74989dac-50dc-4740-85dd-7f034e94c704', 'tr', 'Balon uçuşu ne kadar sürüyor?', 'Transferler ve hazırlık dahil deneyimin tamamı genellikle 3–4 saattir. Uçuş süresi pakete ve operasyon koşullarına göre değişir.', 2, true, CURRENT_TIMESTAMP),
('7b1a940b-9406-4627-b7b6-fa42198f7225', 'tr', 'Ne giymeliyim?', 'Kapalı ayakkabı ve katmanlı giysi tercih edin. Kapadokya sabahları sıcak aylarda bile serin olabilir.', 3, true, CURRENT_TIMESTAMP),
('ecfade98-d179-4024-bbdb-7f7dc2dd6736', 'tr', 'Çocuklar uçabilir mi?', 'Yaş ve boy sınırları operatöre ve güncel güvenlik kurallarına bağlıdır. Rezervasyondan önce çocuğun yaşını ve boyunu bize iletin.', 4, true, CURRENT_TIMESTAMP),
('5ae36465-076d-4757-a7ff-385048729d20', 'tr', 'Alım saatimi ne zaman öğreneceğim?', 'Kesin alım saatiniz rezervasyondan sonra, genellikle deneyiminizden bir önceki akşam teyit edilir.', 5, true, CURRENT_TIMESTAMP),
('f8acd668-3af5-4390-a457-7cfd60a05ead', 'es', '¿Qué ocurre si mi vuelo en globo se cancela por el tiempo?', 'La seguridad es lo primero. Si la autoridad aeronáutica cancela el vuelo, te ayudamos a pasar a la siguiente fecha disponible o tramitamos el reembolso definido en tus condiciones de reserva.', 0, true, CURRENT_TIMESTAMP),
('da8d908c-5428-4300-9be6-ccdc9f3136fe', 'es', '¿Está incluida la recogida en el hotel?', 'La recogida está incluida en los tours marcados como «Recogida en hotel incluida» o «Hoteles seleccionados incluidos». Indica tu hotel al reservar para que nuestro equipo confirme la cobertura.', 1, true, CURRENT_TIMESTAMP),
('e2f774b4-279d-4a34-913a-1c6ab3b456e7', 'es', '¿Cuánto dura el vuelo en globo?', 'La experiencia completa suele durar entre 3 y 4 horas, incluidos los traslados y la preparación. La duración del vuelo depende del paquete y de las condiciones de operación.', 2, true, CURRENT_TIMESTAMP),
('34460cb1-c077-489a-b87c-687e97eb92a3', 'es', '¿Qué ropa debo llevar?', 'Lleva calzado cerrado y ropa por capas. Las mañanas en Capadocia pueden ser frescas incluso en los meses cálidos.', 3, true, CURRENT_TIMESTAMP),
('6feac779-7984-4a95-857e-66cd6e7405e5', 'es', '¿Pueden volar los niños?', 'Las restricciones de edad y altura dependen del operador y de las normas de seguridad vigentes. Envíanos la edad y la altura del niño antes de reservar.', 4, true, CURRENT_TIMESTAMP),
('758ebebf-1222-40c2-9d45-ed67074dedc7', 'es', '¿Cuándo sabré mi hora de recogida?', 'La hora exacta de recogida se confirma tras la reserva, normalmente la tarde anterior a tu experiencia.', 5, true, CURRENT_TIMESTAMP),
('2696dc6d-a1bc-436f-80d6-9b0a503d1755', 'it', 'Cosa succede se il mio volo in mongolfiera viene annullato per il meteo?', 'La sicurezza viene prima di tutto. Se l’autorità aeronautica annulla il volo, ti aiutiamo a spostarti alla prima data disponibile oppure elaboriamo il rimborso previsto dalle tue condizioni di prenotazione.', 0, true, CURRENT_TIMESTAMP),
('aa36092f-bd5f-4f48-b944-65846491e5dd', 'it', 'Il prelievo in hotel è incluso?', 'Il prelievo è incluso nei tour indicati come «Prelievo in hotel incluso» o «Hotel selezionati inclusi». Inserisci il tuo hotel al momento della prenotazione così il nostro team può confermare la copertura.', 1, true, CURRENT_TIMESTAMP),
('f6c85f70-940e-49ce-9a17-ff996112cc5b', 'it', 'Quanto dura il volo in mongolfiera?', 'L’esperienza completa dura di solito 3–4 ore, inclusi transfer e preparazione. La durata del volo dipende dal pacchetto e dalle condizioni operative.', 2, true, CURRENT_TIMESTAMP),
('f9a97d06-4a9a-4279-8935-bf834663a3de', 'it', 'Come devo vestirmi?', 'Indossa scarpe chiuse e vestiti a strati. In Cappadocia le mattine possono essere fresche anche nei mesi più caldi.', 3, true, CURRENT_TIMESTAMP),
('4a0fedba-6ec3-4c2f-b22f-1811ffa15450', 'it', 'I bambini possono volare?', 'I limiti di età e altezza dipendono dall’operatore e dalle norme di sicurezza vigenti. Inviaci età e altezza del bambino prima di prenotare.', 4, true, CURRENT_TIMESTAMP),
('7f22247d-28cc-49a0-be7b-7e53ab372b35', 'it', 'Quando riceverò l’orario di prelievo?', 'L’orario esatto di prelievo viene confermato dopo la prenotazione, di norma la sera prima dell’esperienza.', 5, true, CURRENT_TIMESTAMP),
('7ba11c19-f657-4a90-8422-b812ad96a7b4', 'ru', 'Что будет, если полёт отменят из-за погоды?', 'Безопасность превыше всего. Если авиационные власти отменяют полёт, мы поможем перенести его на ближайшую доступную дату или оформим возврат в соответствии с условиями вашего бронирования.', 0, true, CURRENT_TIMESTAMP),
('39378d05-aad4-46ee-a056-8daf704f7de2', 'ru', 'Трансфер от отеля включён?', 'Трансфер включён в туры с пометкой «Трансфер от отеля включён» или «Отдельные отели включены». Укажите свой отель при бронировании, чтобы наша команда подтвердила зону обслуживания.', 1, true, CURRENT_TIMESTAMP),
('60ae4425-6e94-4fbe-8e14-702c9e4efca3', 'ru', 'Сколько длится полёт на шаре?', 'Полная программа обычно занимает 3–4 часа вместе с трансферами и подготовкой. Длительность самого полёта зависит от пакета и условий эксплуатации.', 2, true, CURRENT_TIMESTAMP),
('a718ec80-a107-424d-afcb-515bbdb6504e', 'ru', 'Что надеть?', 'Наденьте закрытую обувь и одежду слоями. Утро в Каппадокии бывает прохладным даже в тёплые месяцы.', 3, true, CURRENT_TIMESTAMP),
('7025f219-ce23-4522-9c7e-85375de7e19c', 'ru', 'Могут ли дети участвовать в полёте?', 'Ограничения по возрасту и росту зависят от оператора и действующих правил безопасности. Сообщите нам возраст и рост ребёнка до бронирования.', 4, true, CURRENT_TIMESTAMP),
('eef47614-9387-43cc-8f52-624b57fa4f80', 'ru', 'Когда я узнаю время трансфера?', 'Точное время трансфера подтверждается после бронирования, обычно вечером накануне.', 5, true, CURRENT_TIMESTAMP);
