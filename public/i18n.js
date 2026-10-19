/* GasDost — English / हिन्दी / मराठी
 *
 * One shared file for the delivery app and the admin console. The pages are
 * written in English; this swaps on-screen text for Hindi or Marathi, and puts
 * the English back when English is picked. It also catches text the apps put
 * up later (toasts, status words, counts) by watching the page for changes.
 *
 * Anything not in the lists below — customer names, addresses, mobile
 * numbers, the WhatsApp message wording — is left exactly as it is.
 * Put data-noi18n on an element to keep everything inside it untouched.
 */
(function(){
  const LANG_KEY = 'lmbg_lang_v1';
  const LANGS = [['en','English','EN'], ['hi','हिन्दी','हिं'], ['mr','मराठी','मरा']];

  // [English, Hindi, Marathi]
  const T = [
    // ---------- shared words ----------
    ['Dashboard','डैशबोर्ड','डॅशबोर्ड'],
    ['Add','जोड़ें','जोडा'],
    ['Location','लोकेशन','लोकेशन'],
    ['Consumer','ग्राहक','ग्राहक'],
    ['Live Map','लाइव मैप','लाइव्ह नकाशा'],
    ['Route','रूट','मार्ग'],
    ['Total','कुल','एकूण'],
    ['Pending','बाकी','बाकी'],
    ['Delivered','डिलीवर हुआ','डिलिव्हर झाले'],
    ['Name','नाम','नाव'],
    ['Mobile','मोबाइल','मोबाइल'],
    ['Mobile number','मोबाइल नंबर','मोबाइल नंबर'],
    ['Mobile Number','मोबाइल नंबर','मोबाइल नंबर'],
    ['Mobile No.','मोबाइल नं.','मोबाइल नं.'],
    ['Booking','बुकिंग','बुकिंग'],
    ['Bookings','बुकिंग','बुकिंग'],
    ['Address','पता','पत्ता'],
    ['Dealer','डीलर','डीलर'],
    ['Dealer name','डीलर का नाम','डीलरचे नाव'],
    ['Dealer Name','डीलर का नाम','डीलरचे नाव'],
    ['Customer','ग्राहक','ग्राहक'],
    ['Customers','ग्राहक','ग्राहक'],
    ['Status','स्थिति','स्थिती'],
    ['Action','काम','कृती'],
    ['Close','बंद करें','बंद करा'],
    ['Cancel','रद्द करें','रद्द करा'],
    ['Waiting','इंतज़ार','प्रतीक्षा'],
    ['Live','लाइव','लाइव्ह'],
    ['✓ Delivered','✓ डिलीवर हुआ','✓ डिलिव्हर झाले'],
    ['Selected','चुना गया','निवडलेले'],
    ['optional','वैकल्पिक','ऐच्छिक'],
    ['Zoom in','ज़ूम इन','झूम इन'],
    ['Zoom out','ज़ूम आउट','झूम आउट'],

    // ---------- delivery app: login & header ----------
    ['Login with your name and mobile number to start taking deliveries. The office sees your name on the delivery status screen, and customers see your number when you send them a tracking link.',
     'डिलीवरी शुरू करने के लिए अपना नाम और मोबाइल नंबर डालकर लॉगिन करें। ऑफिस को आपका नाम दिखेगा, और ग्राहक को लिंक भेजने पर आपका नंबर दिखेगा।',
     'डिलिव्हरी सुरू करण्यासाठी तुमचे नाव आणि मोबाइल नंबर टाकून लॉगिन करा. ऑफिसला तुमचे नाव दिसेल, आणि ग्राहकाला लिंक पाठवल्यावर तुमचा नंबर दिसेल.'],
    ['Your name','आपका नाम','तुमचे नाव'],
    ['Your mobile number','आपका मोबाइल नंबर','तुमचा मोबाइल नंबर'],
    ['Login','लॉगिन','लॉगिन'],
    ['⬇ Install app','⬇ ऐप इंस्टॉल करें','⬇ ॲप इन्स्टॉल करा'],
    ['e.g. Suresh Kadam','जैसे: सुरेश कदम','उदा. सुरेश कदम'],
    ['10-digit mobile number','10 अंकों का मोबाइल नंबर','10 अंकी मोबाइल नंबर'],
    ['e.g. 9876543210','जैसे: 9876543210','उदा. 9876543210'],
    ['Enter your name.','अपना नाम लिखें।','तुमचे नाव लिहा.'],
    ['Enter a valid 10-digit mobile number.','सही 10 अंकों का मोबाइल नंबर लिखें।','योग्य 10 अंकी मोबाइल नंबर लिहा.'],
    ['Log out and switch to a different name or mobile number?','लॉगआउट करके दूसरा नाम या मोबाइल नंबर डालना है?','लॉगआउट करून दुसरे नाव किंवा मोबाइल नंबर टाकायचा आहे का?'],
    ['Connected to the office — customer locations arrive by themselves','ऑफिस से जुड़ा है — ग्राहकों के लोकेशन अपने-आप आएंगे','ऑफिसशी जोडलेले — ग्राहकांचे लोकेशन आपोआप येतील'],
    ['Could not reach the office just now — will keep trying','अभी ऑफिस से संपर्क नहीं हुआ — फिर से कोशिश होती रहेगी','आत्ता ऑफिसशी संपर्क झाला नाही — पुन्हा प्रयत्न सुरू राहील'],
    ['This phone needs to be connected again — ask the office to show the setup QR','इस फ़ोन को फिर से जोड़ना होगा — ऑफिस से सेटअप QR दिखाने को कहें','हा फोन पुन्हा जोडावा लागेल — ऑफिसला सेटअप QR दाखवायला सांगा'],
    ['✅ This phone is now connected to the office','✅ यह फ़ोन अब ऑफिस से जुड़ गया है','✅ हा फोन आता ऑफिसशी जोडला गेला आहे'],

    // ---------- delivery app: dashboard ----------
    ["Today's bookings",'आज की बुकिंग','आजच्या बुकिंग'],
    ["Go to Live Map to see each booking, send location requests from Consumer Link, and mark a booking delivered once it's dropped off.",
     'हर बुकिंग देखने के लिए लाइव मैप खोलें, ग्राहक को लोकेशन लिंक भेजें, और सिलेंडर देने के बाद "डिलीवर हुआ" दबाएँ।',
     'प्रत्येक बुकिंग पाहण्यासाठी लाइव्ह नकाशा उघडा, ग्राहकाला लोकेशन लिंक पाठवा, आणि सिलिंडर दिल्यावर "डिलिव्हर झाले" दाबा.'],
    ['Saved addresses','सेव पते','सेव्ह केलेले पत्ते'],
    ['Doorsteps pinned','पिन किए घर','पिन केलेली घरे'],
    ['Still to pin','पिन करना बाकी','पिन करायचे बाकी'],
    ['Pin a customer once in the Location tab and every future booking for that number starts there — no link, no phone call, nothing needed from the customer. This is the cheapest way to build the round up.',
     'लोकेशन टैब में ग्राहक का घर एक बार पिन करें — उस नंबर की हर अगली बुकिंग वहीं से शुरू होगी। न लिंक, न फ़ोन, ग्राहक से कुछ नहीं चाहिए।',
     'लोकेशन टॅबमध्ये ग्राहकाचे घर एकदा पिन करा — त्या नंबरची पुढची प्रत्येक बुकिंग तिथूनच सुरू होईल. ना लिंक, ना फोन, ग्राहकाकडून काहीच नको.'],
    ['⬇ Back up addresses','⬇ पतों का बैकअप लें','⬇ पत्त्यांचा बॅकअप घ्या'],
    ['⬆ Restore / copy from another phone','⬆ बैकअप वापस लाएँ / दूसरे फ़ोन से कॉपी करें','⬆ बॅकअप परत आणा / दुसऱ्या फोनवरून कॉपी करा'],
    ["Back these up regularly. They live on this phone only, so a lost or wiped phone loses them. The same file restores them here or copies them to another delivery man's phone.",
     'इनका बैकअप नियमित लें। ये सिर्फ़ इसी फ़ोन में हैं — फ़ोन खोया या साफ़ हुआ तो ये भी जाएंगे। वही फ़ाइल इन्हें वापस लाती है या दूसरे डिलीवरी मैन के फ़ोन में कॉपी करती है।',
     'यांचा बॅकअप नियमित घ्या. हे फक्त याच फोनमध्ये आहेत — फोन हरवला किंवा पुसला तर हेही जातील. तीच फाइल हे परत आणते किंवा दुसऱ्या डिलिव्हरी बॉयच्या फोनमध्ये कॉपी करते.'],
    ['No saved addresses yet','अभी कोई पता सेव नहीं','अजून कोणताही पत्ता सेव्ह नाही'],
    ['New bookings uploaded by the office','ऑफिस ने नई बुकिंग भेजी हैं','ऑफिसने नवीन बुकिंग पाठवल्या आहेत'],

    // ---------- delivery app: add ----------
    ['✍️ Manual','✍️ हाथ से','✍️ हाताने'],
    ['📊 Bulk Upload','📊 एक साथ अपलोड','📊 एकदम अपलोड'],
    ['📷 Scan QR','📷 QR स्कैन','📷 QR स्कॅन'],
    ['Add a mobile number','मोबाइल नंबर जोड़ें','मोबाइल नंबर जोडा'],
    ['Mobile number (10 digits)','मोबाइल नंबर (10 अंक)','मोबाइल नंबर (10 अंक)'],
    ['➕ Add booking','➕ बुकिंग जोड़ें','➕ बुकिंग जोडा'],
    ['This creates a placeholder booking with just the mobile number. Name and address come from a bulk upload, or can be filled in once the customer shares their location.',
     'इससे सिर्फ़ मोबाइल नंबर वाली बुकिंग बनती है। नाम और पता बाद में अपलोड से या ग्राहक के लोकेशन भेजने पर आ जाएंगे।',
     'यामुळे फक्त मोबाइल नंबर असलेली बुकिंग तयार होते. नाव आणि पत्ता नंतर अपलोडमधून किंवा ग्राहकाने लोकेशन पाठवल्यावर येतील.'],
    ['Bulk add from Excel','Excel से एक साथ जोड़ें','Excel मधून एकदम जोडा'],
    ['Download the template, fill in one row per customer — mobile number and name — then upload it here. Same template the office uses.',
     'टेम्पलेट डाउनलोड करें, हर ग्राहक की एक लाइन भरें — मोबाइल नंबर और नाम — फिर यहाँ अपलोड करें। ऑफिस वाला ही टेम्पलेट है।',
     'टेम्पलेट डाउनलोड करा, प्रत्येक ग्राहकाची एक ओळ भरा — मोबाइल नंबर आणि नाव — मग इथे अपलोड करा. ऑफिसचाच टेम्पलेट आहे.'],
    ['⬇ Download template','⬇ टेम्पलेट डाउनलोड करें','⬇ टेम्पलेट डाउनलोड करा'],
    ['⬆ Upload filled template','⬆ भरा हुआ टेम्पलेट अपलोड करें','⬆ भरलेला टेम्पलेट अपलोड करा'],
    ['Scan bulk booking QR','बुकिंग QR स्कैन करें','बुकिंग QR स्कॅन करा'],
    ['Ask the office to generate a bulk booking QR code from the admin app, then scan it here to import all those bookings at once.',
     'ऑफिस से बुकिंग का QR कोड बनवाएँ, फिर यहाँ स्कैन करें — सारी बुकिंग एक साथ आ जाएंगी।',
     'ऑफिसकडून बुकिंगचा QR कोड बनवून घ्या, मग इथे स्कॅन करा — सर्व बुकिंग एकदम येतील.'],
    ['📷 Start camera scan','📷 कैमरा से स्कैन शुरू करें','📷 कॅमेऱ्याने स्कॅन सुरू करा'],
    ['Stop scanning','स्कैन बंद करें','स्कॅन थांबवा'],
    ['A booking for this mobile number already exists.','इस मोबाइल नंबर की बुकिंग पहले से है।','या मोबाइल नंबरची बुकिंग आधीच आहे.'],
    ['Template downloaded','टेम्पलेट डाउनलोड हुआ','टेम्पलेट डाउनलोड झाला'],
    ['Camera access is not available in this browser.','इस ब्राउज़र में कैमरा नहीं चलेगा।','या ब्राउझरमध्ये कॅमेरा चालणार नाही.'],
    ['QR scanner failed to load. Check your connection and try again.','QR स्कैनर नहीं खुला। इंटरनेट देखकर फिर कोशिश करें।','QR स्कॅनर उघडला नाही. इंटरनेट तपासून पुन्हा प्रयत्न करा.'],
    ['Excel support failed to load. Check your connection and try again.','Excel नहीं खुला। इंटरनेट देखकर फिर कोशिश करें।','Excel उघडले नाही. इंटरनेट तपासून पुन्हा प्रयत्न करा.'],

    // ---------- delivery app: set location ----------
    ["Set / pin a booking's location",'बुकिंग का लोकेशन पिन करें','बुकिंगचे लोकेशन पिन करा'],
    ['Load consumer details','ग्राहक की जानकारी खोलें','ग्राहकाची माहिती उघडा'],
    ['Current pin','अभी का पिन','सध्याचा पिन'],
    ['Saved address','सेव पता','सेव्ह केलेला पत्ता'],
    ['Use my current location','मेरा अभी का लोकेशन लें','माझे सध्याचे लोकेशन घ्या'],
    ['Click anywhere on the map to drop the pin manually, then tap Save below the map.','मैप पर कहीं भी दबाकर पिन लगाएँ, फिर नीचे "सेव" दबाएँ।','नकाशावर कुठेही दाबून पिन लावा, मग खाली "सेव्ह" दाबा.'],
    ['Map — click to set pin','मैप — पिन लगाने के लिए दबाएँ','नकाशा — पिन लावण्यासाठी दाबा'],
    ['Pin moved — tap Save to confirm this location.','पिन हिला — यह लोकेशन पक्का करने के लिए "सेव" दबाएँ।','पिन हलला — हे लोकेशन पक्के करण्यासाठी "सेव्ह" दाबा.'],
    ['💾 Save location','💾 लोकेशन सेव करें','💾 लोकेशन सेव्ह करा'],
    ['Load a booking first.','पहले बुकिंग खोलें।','आधी बुकिंग उघडा.'],
    ['No booking found for this mobile number.','इस मोबाइल नंबर की कोई बुकिंग नहीं मिली।','या मोबाइल नंबरची बुकिंग सापडली नाही.'],
    ['Getting your location…','आपका लोकेशन ले रहे हैं…','तुमचे लोकेशन घेत आहोत…'],
    ['Geolocation not supported in this browser.','इस ब्राउज़र में लोकेशन नहीं चलता।','या ब्राउझरमध्ये लोकेशन चालत नाही.'],

    // ---------- delivery app: consumer link ----------
    ['Find consumer & send link','ग्राहक खोजें और लिंक भेजें','ग्राहक शोधा आणि लिंक पाठवा'],
    ['Look up a consumer, then send them the tracking link on their own WhatsApp — it opens your WhatsApp app with their number and a prefilled, personalized message ready to go.',
     'ग्राहक खोजें, फिर उनके WhatsApp पर लिंक भेजें — आपका WhatsApp उनके नंबर और तैयार मैसेज के साथ खुलेगा।',
     'ग्राहक शोधा, मग त्यांच्या WhatsApp वर लिंक पाठवा — तुमचे WhatsApp त्यांच्या नंबर आणि तयार मेसेजसह उघडेल.'],
    ['Find consumer','ग्राहक खोजें','ग्राहक शोधा'],
    ['📲 Send link via WhatsApp','📲 WhatsApp से लिंक भेजें','📲 WhatsApp ने लिंक पाठवा'],
    ['👁 Preview message','👁 मैसेज देखें','👁 मेसेज पहा'],
    ['Not sent — deploy the app first','नहीं भेजा — पहले ऐप ऑनलाइन डालें','पाठवले नाही — आधी ॲप ऑनलाइन टाका'],

    // ---------- delivery app: live map ----------
    ['All bookings — live map','सारी बुकिंग — लाइव मैप','सर्व बुकिंग — लाइव्ह नकाशा'],
    ['Waiting for location','लोकेशन का इंतज़ार','लोकेशनची प्रतीक्षा'],
    ['Location shared','लोकेशन मिला','लोकेशन मिळाले'],
    ['🔵 Center on my location','🔵 मेरे लोकेशन पर लाएँ','🔵 माझ्या लोकेशनवर आणा'],
    ['Location permission denied — allow it to see your own pin.','लोकेशन की अनुमति नहीं मिली — अपना पिन देखने के लिए अनुमति दें।','लोकेशनची परवानगी मिळाली नाही — तुमचा पिन पाहण्यासाठी परवानगी द्या.'],
    ['The blue dot is you, updating as you move. Tap any pin for its details.','नीला बिंदु आप हैं, चलने पर साथ चलता है। जानकारी के लिए किसी भी पिन को दबाएँ।','निळा बिंदू म्हणजे तुम्ही, चालताना सोबत हलतो. माहितीसाठी कोणताही पिन दाबा.'],
    ['Booking details','बुकिंग की जानकारी','बुकिंगची माहिती'],
    ['🧭 Navigate','🧭 रास्ता दिखाएँ','🧭 रस्ता दाखवा'],
    ['✅ Delivered','✅ डिलीवर हुआ','✅ डिलिव्हर झाले'],
    ['✅ Mark delivered','✅ डिलीवर हुआ दबाएँ','✅ डिलिव्हर झाले दाबा'],
    ['Map images aren’t loading. Your bookings and pins are fine — check the internet connection, or open the app from its web address rather than a file on the computer.',
     'मैप नहीं दिख रहा। आपकी बुकिंग और पिन सुरक्षित हैं — इंटरनेट देखें।',
     'नकाशा दिसत नाही. तुमच्या बुकिंग आणि पिन सुरक्षित आहेत — इंटरनेट तपासा.'],
    ['Bookings centered on your current location','बुकिंग आपके अभी के लोकेशन के पास दिखाई गईं','बुकिंग तुमच्या सध्याच्या लोकेशनजवळ दाखवल्या'],

    // ---------- delivery app: route ----------
    ["Plan today's run",'आज का रूट बनाएँ','आजचा मार्ग ठरवा'],
    ["Puts your pending bookings in a sensible order starting from where you are now, so you're not criss-crossing the city.",
     'बाकी बुकिंग को आपकी जगह से सही क्रम में लगाता है, ताकि शहर में बेकार चक्कर न लगें।',
     'बाकी बुकिंग तुमच्या ठिकाणापासून योग्य क्रमाने लावते, म्हणजे शहरात उगाच फेऱ्या होणार नाहीत.'],
    ['🧭 Plan route from my location','🧭 मेरी जगह से रूट बनाएँ','🧭 माझ्या ठिकाणापासून मार्ग ठरवा'],
    ['Plan from the depot instead','गोदाम से रूट बनाएँ','गोदामापासून मार्ग ठरवा'],
    ['Only bookings that aren\'t delivered yet are included. Mark one delivered and plan again to drop it from the run.',
     'सिर्फ़ बाकी बुकिंग गिनी जाती हैं। किसी को डिलीवर करके फिर से रूट बनाएँ तो वह हट जाएगी।',
     'फक्त बाकी बुकिंग धरल्या जातात. एखादी डिलिव्हर करून पुन्हा मार्ग ठरवल्यास ती निघून जाईल.'],
    ['🚗 Open whole route in Google Maps','🚗 पूरा रूट Google Maps में खोलें','🚗 पूर्ण मार्ग Google Maps मध्ये उघडा'],
    ['➡️ Navigate to stop 1 only','➡️ सिर्फ़ पहले स्टॉप तक जाएँ','➡️ फक्त पहिल्या थांब्यापर्यंत जा'],
    ['Each stop is the nearest one left to visit, measured straight-line — close enough in town. Google Maps handles the actual roads and turn-by-turn once you tap through.',
     'हर अगला स्टॉप सबसे पास वाला है। असली रास्ता Google Maps बताएगा।',
     'प्रत्येक पुढचा थांबा सर्वात जवळचा आहे. खरा रस्ता Google Maps सांगेल.'],
    ['Stops in order','क्रम से स्टॉप','क्रमाने थांबे'],
    ['Nothing pending — every booking is marked delivered.','कुछ बाकी नहीं — सारी बुकिंग डिलीवर हो गईं।','काहीच बाकी नाही — सर्व बुकिंग डिलिव्हर झाल्या.'],
    ['Couldn’t get your location — planned from the depot instead.','आपका लोकेशन नहीं मिला — गोदाम से रूट बनाया।','तुमचे लोकेशन मिळाले नाही — गोदामापासून मार्ग ठरवला.'],
    ['This browser can’t provide your location — planning from the depot instead.','इस ब्राउज़र से लोकेशन नहीं मिलता — गोदाम से रूट बना रहे हैं।','या ब्राउझरमधून लोकेशन मिळत नाही — गोदामापासून मार्ग ठरवत आहोत.'],
    ['App installed! Find it on your home screen.','ऐप इंस्टॉल हो गया! होम स्क्रीन पर देखें।','ॲप इन्स्टॉल झाले! होम स्क्रीनवर पहा.'],
    ['Use your browser menu → "Add to Home Screen".','ब्राउज़र मेनू → "Add to Home Screen" दबाएँ।','ब्राउझर मेनू → "Add to Home Screen" दाबा.'],
    ['That was an old customer link — ask the office to resend it','यह पुराना लिंक है — ऑफिस से नया भेजने को कहें','ही जुनी लिंक आहे — ऑफिसला नवीन पाठवायला सांगा'],

    // ---------- admin: header & tabs ----------
    ['⛽ GasDost — Admin','⛽ GasDost — एडमिन','⛽ GasDost — ॲडमिन'],
    ['Desktop console','ऑफिस कंसोल','ऑफिस कन्सोल'],
    ['📊 Delivery status','📊 डिलीवरी स्थिति','📊 डिलिव्हरी स्थिती'],
    ['📦 Bookings','📦 बुकिंग','📦 बुकिंग'],
    ['👥 Customers','👥 ग्राहक','👥 ग्राहक'],
    ['📤 Send links','📤 लिंक भेजें','📤 लिंक पाठवा'],
    ['⚪ Offline — click to connect','⚪ ऑफलाइन — जोड़ने के लिए दबाएँ','⚪ ऑफलाइन — जोडण्यासाठी दाबा'],
    ['⚪ Offline — click to retry','⚪ ऑफलाइन — फिर कोशिश करें','⚪ ऑफलाइन — पुन्हा प्रयत्न करा'],
    ['⚪ Offline (opened from a file)','⚪ ऑफलाइन (फ़ाइल से खोला)','⚪ ऑफलाइन (फाइलमधून उघडले)'],
    ['🟢 Online','🟢 ऑनलाइन','🟢 ऑनलाइन'],
    ['🟡 Online (connection hiccup)','🟡 ऑनलाइन (कनेक्शन धीमा)','🟡 ऑनलाइन (कनेक्शन मंद)'],
    ['🔴 Wrong password — click to retry','🔴 गलत पासवर्ड — फिर कोशिश करें','🔴 चुकीचा पासवर्ड — पुन्हा प्रयत्न करा'],
    ['Click to connect to the online database','ऑनलाइन डेटाबेस से जोड़ने के लिए दबाएँ','ऑनलाइन डेटाबेसशी जोडण्यासाठी दाबा'],
    ['Saving to the online database','ऑनलाइन डेटाबेस में सेव हो रहा है','ऑनलाइन डेटाबेसमध्ये सेव्ह होत आहे'],
    ['Office password for the online database:','ऑनलाइन डेटाबेस का ऑफिस पासवर्ड:','ऑनलाइन डेटाबेसचा ऑफिस पासवर्ड:'],
    ['That password was not accepted.','यह पासवर्ड सही नहीं है।','हा पासवर्ड बरोबर नाही.'],
    ['Connected to the online database','ऑनलाइन डेटाबेस से जुड़ गया','ऑनलाइन डेटाबेसशी जोडले'],
    ['The online database only works when this console is opened from your Netlify site, not from a file on this computer.',
     'ऑनलाइन डेटाबेस तभी चलेगा जब यह कंसोल आपकी Netlify साइट से खोला जाए, कंप्यूटर की फ़ाइल से नहीं।',
     'ऑनलाइन डेटाबेस तेव्हाच चालेल जेव्हा हे कन्सोल तुमच्या Netlify साइटवरून उघडले जाईल, कॉम्प्युटरच्या फाइलमधून नाही.'],

    // ---------- admin: delivery status ----------
    ["📱 Connect a delivery man's phone",'📱 डिलीवरी मैन का फ़ोन जोड़ें','📱 डिलिव्हरी बॉयचा फोन जोडा'],
    ['Show setup QR code','सेटअप QR कोड दिखाएँ','सेटअप QR कोड दाखवा'],
    ["Do this once per phone. Open the phone's camera, point it at the QR code and tap the link. From then on, locations customers send appear on his map by themselves.",
     'हर फ़ोन पर एक बार करें। फ़ोन का कैमरा खोलें, QR कोड पर रखें और लिंक दबाएँ। उसके बाद ग्राहकों के लोकेशन उसके मैप पर अपने-आप आएंगे।',
     'प्रत्येक फोनवर एकदाच करा. फोनचा कॅमेरा उघडा, QR कोडवर धरा आणि लिंक दाबा. त्यानंतर ग्राहकांचे लोकेशन त्याच्या नकाशावर आपोआप येतील.'],
    ['Show this only to your own delivery men. Anyone who scans it can see customer locations. Close it when you are done.',
     'यह सिर्फ़ अपने डिलीवरी मैन को दिखाएँ। जो भी स्कैन करेगा वह ग्राहकों के लोकेशन देख सकेगा। काम होने पर बंद करें।',
     'हे फक्त तुमच्या डिलिव्हरी बॉयना दाखवा. जो कोणी स्कॅन करेल तो ग्राहकांचे लोकेशन पाहू शकेल. काम झाल्यावर बंद करा.'],
    ['Delivery status','डिलीवरी स्थिति','डिलिव्हरी स्थिती'],
    ['Overall progress across all bookings, then broken down by delivery man.','सारी बुकिंग की प्रगति, फिर हर डिलीवरी मैन की अलग।','सर्व बुकिंगची प्रगती, मग प्रत्येक डिलिव्हरी बॉयची वेगळी.'],
    ['Total bookings','कुल बुकिंग','एकूण बुकिंग'],
    ['Completed','पूरा','पूर्ण'],
    ['Delivery man','डिलीवरी मैन','डिलिव्हरी बॉय'],
    ['Assigned','सौंपी गई','दिलेल्या'],
    ['Progress','प्रगति','प्रगती'],
    ['🟢 Active','🟢 सक्रिय','🟢 सक्रिय'],
    ['Unassigned','किसी को नहीं सौंपी','कोणालाही दिलेली नाही'],
    ['Not seen','दिखा नहीं','दिसला नाही'],
    ['Share of all bookings delivered','कितनी बुकिंग डिलीवर हुईं','किती बुकिंग डिलिव्हर झाल्या'],
    ['"Active" means the delivery app reported activity on that phone in the last 15 minutes. Bookings are counted against whoever they were added by, or whoever marked them delivered. This demo reads browser storage shared with the delivery app, so live figures only appear when both apps are opened from the same site — as separate local files, each has its own storage and you\'ll see seed data only.',
     '"सक्रिय" यानी पिछले 15 मिनट में उस फ़ोन पर ऐप चला। बुकिंग उसी के नाम गिनी जाती है जिसने जोड़ी या डिलीवर की।',
     '"सक्रिय" म्हणजे गेल्या 15 मिनिटांत त्या फोनवर ॲप चालले. बुकिंग ज्याने जोडली किंवा डिलिव्हर केली त्याच्या नावावर मोजली जाते.'],
    ['No bookings yet — add some below, or open the delivery app to seed the demo data.','अभी कोई बुकिंग नहीं।','अजून कोणतीही बुकिंग नाही.'],

    // ---------- admin: bookings ----------
    ['Add bookings from an Excel file','Excel फ़ाइल से बुकिंग जोड़ें','Excel फाइलमधून बुकिंग जोडा'],
    ['Download the template, fill in one row per customer — just mobile number and name — then upload it here to add them all at once.',
     'टेम्पलेट डाउनलोड करें, हर ग्राहक की एक लाइन भरें — सिर्फ़ मोबाइल नंबर और नाम — फिर यहाँ अपलोड करें, सब एक साथ जुड़ जाएंगे।',
     'टेम्पलेट डाउनलोड करा, प्रत्येक ग्राहकाची एक ओळ भरा — फक्त मोबाइल नंबर आणि नाव — मग इथे अपलोड करा, सर्व एकदम जोडले जातील.'],
    ['⬇ Download Excel template','⬇ Excel टेम्पलेट डाउनलोड करें','⬇ Excel टेम्पलेट डाउनलोड करा'],
    ['Add booking to batch','बैच में बुकिंग जोड़ें','बॅचमध्ये बुकिंग जोडा'],
    ['Search your saved customers and tap','सेव ग्राहक खोजें और','सेव्ह केलेले ग्राहक शोधा आणि'],
    [', or type a mobile number below — if the customer is saved, their name, address and dealer fill in by themselves.',
     'दबाएँ, या नीचे मोबाइल नंबर लिखें — ग्राहक सेव है तो नाम, पता और डीलर अपने-आप भर जाएंगे।',
     'दाबा, किंवा खाली मोबाइल नंबर लिहा — ग्राहक सेव्ह असेल तर नाव, पत्ता आणि डीलर आपोआप भरले जातील.'],
    ['Search saved customers','सेव ग्राहक खोजें','सेव्ह केलेले ग्राहक शोधा'],
    ['No saved customers yet — add them in the','अभी कोई सेव ग्राहक नहीं —','अजून कोणतेही सेव्ह ग्राहक नाहीत —'],
    ['tab.','टैब में जोड़ें।','टॅबमध्ये जोडा.'],
    ['Booking ID','बुकिंग ID','बुकिंग ID'],
    ['Consumer name','ग्राहक का नाम','ग्राहकाचे नाव'],
    ['➕ Add to batch','➕ बैच में जोड़ें','➕ बॅचमध्ये जोडा'],
    ['➕ Add','➕ जोड़ें','➕ जोडा'],
    ['✓ In batch','✓ बैच में है','✓ बॅचमध्ये आहे'],
    ['Batch','बैच','बॅच'],
    ['Review the batch, then generate the QR code. Large batches may be less reliable to scan — keep to about 15 or fewer per code.',
     'बैच जाँचें, फिर QR कोड बनाएँ। एक कोड में 15 या कम बुकिंग रखें।',
     'बॅच तपासा, मग QR कोड बनवा. एका कोडमध्ये 15 किंवा कमी बुकिंग ठेवा.'],
    ['No bookings added yet.','अभी कोई बुकिंग नहीं जोड़ी।','अजून कोणतीही बुकिंग जोडली नाही.'],
    ['⬆ Upload batch','⬆ बैच अपलोड करें','⬆ बॅच अपलोड करा'],
    ['📱 Generate QR code','📱 QR कोड बनाएँ','📱 QR कोड बनवा'],
    ['Clear batch','बैच खाली करें','बॅच रिकामी करा'],
    ["Upload sends the batch straight to the delivery app — it shows up on the delivery man's dashboard right away, no scanning needed. Use the QR code instead when his phone can't reach the same system.",
     'अपलोड करने पर बैच सीधे डिलीवरी ऐप में जाता है। फ़ोन न जुड़ा हो तो QR कोड इस्तेमाल करें।',
     'अपलोड केल्यावर बॅच थेट डिलिव्हरी ॲपमध्ये जाते. फोन जोडलेला नसेल तर QR कोड वापरा.'],
    ['⬇ Download QR as PNG','⬇ QR फ़ोटो डाउनलोड करें','⬇ QR फोटो डाउनलोड करा'],
    ['auto-generated if left blank','खाली छोड़ें तो अपने-आप बनेगा','रिकामे ठेवल्यास आपोआप बनेल'],
    ['e.g. Ramesh Patil','जैसे: रमेश पाटील','उदा. रमेश पाटील'],
    ['Saved customer found — details filled in.','सेव ग्राहक मिला — जानकारी भर दी।','सेव्ह ग्राहक सापडला — माहिती भरली.'],
    ['✅ Saved customer found — details filled in.','✅ सेव ग्राहक मिला — जानकारी भर दी।','✅ सेव्ह ग्राहक सापडला — माहिती भरली.'],
    ['No saved customer matches that.','ऐसा कोई सेव ग्राहक नहीं मिला।','असा कोणताही सेव्ह ग्राहक सापडला नाही.'],
    ['This mobile number is already in the batch.','यह मोबाइल नंबर बैच में पहले से है।','हा मोबाइल नंबर बॅचमध्ये आधीच आहे.'],
    ["Enter the customer's name.",'ग्राहक का नाम लिखें।','ग्राहकाचे नाव लिहा.'],
    ['Nothing new to upload','अपलोड करने को कुछ नया नहीं','अपलोड करायला काही नवीन नाही'],
    ['Generate the QR code first','पहले QR कोड बनाएँ','आधी QR कोड बनवा'],

    // ---------- admin: customers ----------
    ['Upload customer list','ग्राहक सूची अपलोड करें','ग्राहक यादी अपलोड करा'],
    ['Download the template, fill in one row per customer, upload it, then press','टेम्पलेट डाउनलोड करें, हर ग्राहक की एक लाइन भरें, अपलोड करें, फिर','टेम्पलेट डाउनलोड करा, प्रत्येक ग्राहकाची एक ओळ भरा, अपलोड करा, मग'],
    ['Save customers','ग्राहक सेव करें','ग्राहक सेव्ह करा'],
    ['. When the console shows','दबाएँ। जब ऊपर दाएँ','दाबा. जेव्हा वर उजवीकडे'],
    ['🟢 Online','🟢 ऑनलाइन','🟢 ऑनलाइन'],
    ['(top right), customers are saved in the online database — safe even if this browser is cleared, and the same on every office computer. They can be searched in',
     'दिखे, तो ग्राहक ऑनलाइन डेटाबेस में सेव होते हैं — ब्राउज़र साफ़ होने पर भी सुरक्षित, और हर ऑफिस कंप्यूटर पर एक जैसे। इन्हें यहाँ खोज सकते हैं:',
     'दिसेल, तेव्हा ग्राहक ऑनलाइन डेटाबेसमध्ये सेव्ह होतात — ब्राउझर साफ केला तरी सुरक्षित, आणि प्रत्येक ऑफिस कॉम्प्युटरवर सारखे. ते इथे शोधता येतात:'],
    ['and','और','आणि'],
    ['. Uploading again updates customers already saved (matched by mobile number) and adds the new ones.',
     '। दोबारा अपलोड करने पर पुराने ग्राहक (मोबाइल नंबर से) अपडेट होते हैं और नए जुड़ते हैं।',
     '. पुन्हा अपलोड केल्यावर जुने ग्राहक (मोबाइल नंबरवरून) अपडेट होतात आणि नवीन जोडले जातात.'],
    ['⬇ Download customer template','⬇ ग्राहक टेम्पलेट डाउनलोड करें','⬇ ग्राहक टेम्पलेट डाउनलोड करा'],
    ['Columns:','कॉलम:','कॉलम:'],
    ['First Address','पहला पता','पहिला पत्ता'],
    ['First address','पहला पता','पहिला पत्ता'],
    ['. Name and Mobile Number are required, the rest can be left blank. The','। नाम और मोबाइल नंबर ज़रूरी हैं, बाकी खाली छोड़ सकते हैं।','. नाव आणि मोबाइल नंबर आवश्यक आहेत, बाकी रिकामे ठेवू शकता.'],
    ['Unique code','यूनिक कोड','युनिक कोड'],
    ['is given automatically when you save — C0001, C0002 and so on — and a customer keeps the same code for good.',
     'सेव करते समय अपने-आप मिलता है — C0001, C0002 आदि — और ग्राहक का कोड कभी नहीं बदलता।',
     'सेव्ह करताना आपोआप मिळतो — C0001, C0002 इत्यादी — आणि ग्राहकाचा कोड कधीच बदलत नाही.'],
    ['💾 Save customers','💾 ग्राहक सेव करें','💾 ग्राहक सेव्ह करा'],
    ['Saved customers','सेव ग्राहक','सेव्ह केलेले ग्राहक'],
    ['Find a customer','ग्राहक खोजें','ग्राहक शोधा'],
    ['⬇ Export to Excel','⬇ Excel में निकालें','⬇ Excel मध्ये काढा'],
    ['Delete all','सब हटाएँ','सर्व काढा'],
    ['No customers saved yet. Download the template above, fill it in and upload it.','अभी कोई ग्राहक सेव नहीं। ऊपर से टेम्पलेट डाउनलोड करें, भरें और अपलोड करें।','अजून कोणतेही ग्राहक सेव्ह नाहीत. वरून टेम्पलेट डाउनलोड करा, भरा आणि अपलोड करा.'],
    ['Nobody matches that search.','कोई नहीं मिला।','कोणी सापडले नाही.'],
    ['Name, mobile, address, dealer or unique code','नाम, मोबाइल, पता, डीलर या यूनिक कोड','नाव, मोबाइल, पत्ता, डीलर किंवा युनिक कोड'],
    ['Not saved yet — press Save customers to keep them.','अभी सेव नहीं हुआ — रखने के लिए "ग्राहक सेव करें" दबाएँ।','अजून सेव्ह झाले नाही — ठेवण्यासाठी "ग्राहक सेव्ह करा" दाबा.'],
    ['Customers saved','ग्राहक सेव हो गए','ग्राहक सेव्ह झाले'],
    ['Customers saved to the online database','ग्राहक ऑनलाइन डेटाबेस में सेव हो गए','ग्राहक ऑनलाइन डेटाबेसमध्ये सेव्ह झाले'],
    ['Nothing saved','कुछ सेव नहीं हुआ','काहीच सेव्ह झाले नाही'],
    ['All customers deleted','सारे ग्राहक हटा दिए','सर्व ग्राहक काढले'],
    ['No customers to export','निकालने को कोई ग्राहक नहीं','काढायला कोणतेही ग्राहक नाहीत'],
    ['Customer template downloaded','ग्राहक टेम्पलेट डाउनलोड हुआ','ग्राहक टेम्पलेट डाउनलोड झाला'],

    // ---------- admin: send links ----------
    ['Send location links to customers','ग्राहकों को लोकेशन लिंक भेजें','ग्राहकांना लोकेशन लिंक पाठवा'],
    ['Builds a personalised link for each customer and walks you through sending them on WhatsApp, one tap each. Every link is unique to that customer — it opens a page asking only for their location.',
     'हर ग्राहक के लिए अलग लिंक बनाता है और WhatsApp पर एक-एक टैप में भिजवाता है। लिंक सिर्फ़ लोकेशन माँगता है।',
     'प्रत्येक ग्राहकासाठी वेगळी लिंक बनवते आणि WhatsApp वर एका टॅपमध्ये पाठवायला मदत करते. लिंक फक्त लोकेशन मागते.'],
    ['Who to send to','किसे भेजना है','कोणाला पाठवायचे'],
    ['Bookings waiting for a location','जिनका लोकेशन नहीं आया','ज्यांचे लोकेशन आले नाही'],
    ['All bookings in the delivery app','डिलीवरी ऐप की सारी बुकिंग','डिलिव्हरी ॲपमधील सर्व बुकिंग'],
    ['Whatever is in the current batch','अभी के बैच वाले','सध्याच्या बॅचमधील'],
    ['All saved customers','सारे सेव ग्राहक','सर्व सेव्ह ग्राहक'],
    ["Replies go to (delivery partner's number)",'जवाब इस नंबर पर (डिलीवरी मैन का नंबर)','उत्तर या नंबरवर (डिलिव्हरी बॉयचा नंबर)'],
    ['When a customer shares their location it comes back to this number on WhatsApp, so put the delivery man who is doing that round.',
     'ग्राहक का लोकेशन इसी डिलीवरी मैन को जाएगा — उस राउंड वाले का नंबर डालें।',
     'ग्राहकाचे लोकेशन याच डिलिव्हरी बॉयला जाईल — त्या फेरीवाल्याचा नंबर टाका.'],
    ['10-digit mobile','10 अंकों का मोबाइल','10 अंकी मोबाइल'],
    ['Message template','मैसेज का ढाँचा','मेसेजचा नमुना'],
    ["Edit the wording however you like. The tags in braces are swapped for each customer's own details.",
     'शब्द अपनी मर्ज़ी से बदलें। { } वाले शब्द हर ग्राहक की जानकारी से बदल जाते हैं।',
     'शब्द हवे तसे बदला. { } मधले शब्द प्रत्येक ग्राहकाच्या माहितीने बदलले जातात.'],
    ['Reset to default wording','पुराने शब्द वापस लाएँ','मूळ शब्द परत आणा'],
    ['Preview for the first customer:','पहले ग्राहक के लिए झलक:','पहिल्या ग्राहकासाठी झलक:'],
    ['No customers selected yet.','अभी कोई ग्राहक नहीं चुना।','अजून कोणताही ग्राहक निवडला नाही.'],
    ['Send queue','भेजने की सूची','पाठवायची यादी'],
    ['📲 Send next unsent','📲 अगले को भेजें','📲 पुढच्याला पाठवा'],
    ['📋 Copy all links','📋 सारे लिंक कॉपी करें','📋 सर्व लिंक कॉपी करा'],
    ['Clear sent marks','"भेजा" निशान हटाएँ','"पाठवले" खुणा काढा'],
    ['Each send opens WhatsApp with the message ready —','हर बार WhatsApp तैयार मैसेज के साथ खुलेगा —','प्रत्येक वेळी WhatsApp तयार मेसेजसह उघडेल —'],
    ['you still press send yourself','भेजने का बटन आपको खुद दबाना होगा','पाठवण्याचे बटण तुम्हालाच दाबावे लागेल'],
    ['. There is no way around that from a web page; see the note at the bottom for the paid route that removes it.',
     '। वेब पेज से इसका कोई और रास्ता नहीं; नीचे पैसे वाले तरीके की जानकारी है।',
     '. वेब पेजवरून याला दुसरा मार्ग नाही; खाली पैशाच्या पद्धतीची माहिती आहे.'],
    ['Type a name or mobile number','नाम या मोबाइल नंबर लिखें','नाव किंवा मोबाइल नंबर लिहा'],
    ['is not in this list.','इस सूची में नहीं है।','या यादीत नाही.'],
    ['Customer name (optional)','ग्राहक का नाम (वैकल्पिक)','ग्राहकाचे नाव (ऐच्छिक)'],
    ['📲 Send a link anyway','📲 फिर भी लिंक भेजें','📲 तरीही लिंक पाठवा'],
    ['Useful when someone rings up asking where their cylinder is — send them the link without adding a booking first.',
     'जब कोई फ़ोन करके सिलेंडर पूछे — बिना बुकिंग जोड़े उसे लिंक भेजें।',
     'जेव्हा कोणी फोन करून सिलिंडर विचारेल — बुकिंग न जोडता त्याला लिंक पाठवा.'],
    ['Nobody to send to. Pick a different list above, or add bookings first.','भेजने को कोई नहीं। ऊपर दूसरी सूची चुनें या पहले बुकिंग जोड़ें।','पाठवायला कोणी नाही. वर दुसरी यादी निवडा किंवा आधी बुकिंग जोडा.'],
    ['Nobody here matches that search.','कोई नहीं मिला।','कोणी सापडले नाही.'],
    ['Nobody in this list matches that','इस सूची में कोई नहीं मिला','या यादीत कोणी सापडले नाही'],
    ['Not sent','नहीं भेजा','पाठवले नाही'],
    ['Send','भेजें','पाठवा'],
    ['Send again','फिर भेजें','पुन्हा पाठवा'],
    ['Other ways','दूसरे तरीके','इतर मार्ग'],
    ['📍 Location received','📍 लोकेशन मिला','📍 लोकेशन मिळाले'],
    ['Other ways to reach','संपर्क के दूसरे तरीके:','संपर्काचे इतर मार्ग:'],
    ['If WhatsApp did not work — no WhatsApp on that number, or the message would not go.','अगर WhatsApp न चले — नंबर पर WhatsApp न हो या मैसेज न जाए।','जर WhatsApp चालले नाही — नंबरवर WhatsApp नसेल किंवा मेसेज गेला नाही.'],
    ['📋 Copy whole message','📋 पूरा मैसेज कॉपी करें','📋 पूर्ण मेसेज कॉपी करा'],
    ['🔗 Copy just the link','🔗 सिर्फ़ लिंक कॉपी करें','🔗 फक्त लिंक कॉपी करा'],
    ['💬 Send as SMS','💬 SMS भेजें','💬 SMS पाठवा'],
    ['✉️ Send by email','✉️ ईमेल भेजें','✉️ ईमेल पाठवा'],
    ['🔳 Show QR code','🔳 QR कोड दिखाएँ','🔳 QR कोड दाखवा'],
    ['Let the customer scan this off your screen, or print it on the delivery slip. Opens the same location page.',
     'ग्राहक आपकी स्क्रीन से स्कैन करे या डिलीवरी पर्ची पर छापें। वही लोकेशन पेज खुलेगा।',
     'ग्राहकाने तुमच्या स्क्रीनवरून स्कॅन करावे किंवा डिलिव्हरी पावतीवर छापा. तेच लोकेशन पेज उघडेल.'],
    ['Want it fully automatic?','पूरी तरह अपने-आप चाहिए?','पूर्णपणे आपोआप हवे आहे?'],
    ['Enter the delivery partner’s number first — customers need somewhere to reply','पहले डिलीवरी मैन का नंबर डालें','आधी डिलिव्हरी बॉयचा नंबर टाका'],
    ['Enter the delivery partner’s number first — customers need somewhere to reply','पहले डिलीवरी मैन का नंबर डालें','आधी डिलिव्हरी बॉयचा नंबर टाका'],
    ['Everyone on this list has had one','इस सूची में सबको भेज दिया','या यादीतील सर्वांना पाठवले'],
    ['Wording reset','शब्द वापस आ गए','शब्द परत आले'],
    ['Sent marks cleared','"भेजा" निशान हटे','"पाठवले" खुणा काढल्या'],
    ['Clear the sent marks for this list? The messages already sent are not affected.','इस सूची के "भेजा" निशान हटाएँ? भेजे गए मैसेज पर असर नहीं होगा।','या यादीच्या "पाठवले" खुणा काढायच्या? पाठवलेल्या मेसेजवर परिणाम होणार नाही.'],
    ['Send links','लिंक भेजें','लिंक पाठवा'],
    ['Export to Excel','Excel में निकालें','Excel मध्ये काढा'],
    ['Bulk','एक साथ','एकदम'],
    ['Use {name} {mobile} {address} {dealer} {booking} {link}','इस्तेमाल करें: {name} {mobile} {address} {dealer} {booking} {link}','वापरा: {name} {mobile} {address} {dealer} {booking} {link}'],
    ['The one-tap queue above costs nothing and works today. Proper hands-off broadcasting needs the official WhatsApp Business API, which is a real step up:',
     'ऊपर वाली एक-टैप सूची मुफ़्त है और आज चलती है। पूरी तरह अपने-आप भेजने के लिए WhatsApp Business API चाहिए, जो बड़ा कदम है:',
     'वरची एक-टॅप यादी मोफत आहे आणि आज चालते. पूर्णपणे आपोआप पाठवण्यासाठी WhatsApp Business API लागते, जे मोठे पाऊल आहे:'],
    ['A Meta Business account with your business verified, and a phone number given over to the API — that number can no longer use the normal WhatsApp app',
     'वेरिफ़ाइड Meta Business अकाउंट और API के लिए अलग फ़ोन नंबर — वह नंबर सामान्य WhatsApp में नहीं चलेगा',
     'व्हेरिफाइड Meta Business अकाउंट आणि API साठी वेगळा फोन नंबर — तो नंबर साध्या WhatsApp मध्ये चालणार नाही'],
    ['Message wording submitted to Meta for approval before you may send it, usually a day or two',
     'मैसेज के शब्द पहले Meta से मंज़ूर करवाने होते हैं, आमतौर पर एक-दो दिन',
     'मेसेजचे शब्द आधी Meta कडून मंजूर करून घ्यावे लागतात, साधारण एक-दोन दिवस'],
    ['A small server to hold the API key — it cannot live in this page, because anyone could read it and send messages as you',
     'API key रखने के लिए छोटा सर्वर — वह इस पेज में नहीं रख सकते, वरना कोई भी आपके नाम से मैसेज भेज सकेगा',
     'API key ठेवण्यासाठी छोटा सर्व्हर — ती या पेजमध्ये ठेवता येत नाही, नाहीतर कोणीही तुमच्या नावाने मेसेज पाठवू शकेल'],
    ['A per-message fee. Indian providers such as AiSensy, Interakt, Gupshup or Wati wrap all of the above in a simpler dashboard for a monthly fee',
     'हर मैसेज का शुल्क। AiSensy, Interakt, Gupshup या Wati जैसी भारतीय कंपनियाँ यह सब मासिक शुल्क पर आसान डैशबोर्ड में देती हैं',
     'प्रत्येक मेसेजचे शुल्क. AiSensy, Interakt, Gupshup किंवा Wati सारख्या भारतीय कंपन्या हे सर्व मासिक शुल्कावर सोप्या डॅशबोर्डमध्ये देतात'],
    ['is a similar story in India — a gateway like MSG91 or Fast2SMS, plus DLT registration with TRAI for your sender ID and every message template, and a few paise per message. The per-customer SMS button above needs none of that, because your own phone sends it',
     'भी भारत में ऐसा ही है — MSG91 या Fast2SMS जैसा गेटवे, TRAI में DLT रजिस्ट्रेशन, और हर मैसेज के कुछ पैसे। ऊपर वाले SMS बटन को इनमें से कुछ नहीं चाहिए, क्योंकि आपका अपना फ़ोन भेजता है',
     'सुद्धा भारतात असेच आहे — MSG91 किंवा Fast2SMS सारखा गेटवे, TRAI मध्ये DLT नोंदणी, आणि प्रत्येक मेसेजचे काही पैसे. वरच्या SMS बटणाला यातले काहीच लागत नाही, कारण तुमचा स्वतःचा फोन पाठवतो'],
    ['Worth it once you are sending hundreds a day. Below that, the queue above is usually the better trade. The',
     'रोज़ सैकड़ों मैसेज भेजने लगें तब यह फ़ायदेमंद है। उससे कम में ऊपर वाली सूची ही बेहतर है।',
     'रोज शेकडो मेसेज पाठवू लागल्यावर हे फायदेशीर आहे. त्यापेक्षा कमी असल्यास वरची यादीच चांगली.'],
    ['button gives you exactly the columns those providers ask for, so nothing is wasted if you move later.',
     'बटन वही कॉलम देता है जो ये कंपनियाँ माँगती हैं, इसलिए बाद में बदलने पर कुछ बेकार नहीं जाता।',
     'बटण नेमके तेच कॉलम देते जे या कंपन्या मागतात, त्यामुळे नंतर बदलले तरी काही वाया जात नाही.'],
    ['Find a delivery man','डिलीवरी मैन खोजें','डिलिव्हरी बॉय शोधा'],
    ['Nobody matches that','कोई नहीं मिला','कोणी सापडले नाही'],
    ['No delivery man matches that search.','ऐसा कोई डिलीवरी मैन नहीं मिला।','असा कोणताही डिलिव्हरी बॉय सापडला नाही.'],
    ['No delivery men yet. Connect a phone with the setup QR code above, and he will appear here once he logs in.',
     'अभी कोई डिलीवरी मैन नहीं। ऊपर के सेटअप QR कोड से फ़ोन जोड़ें — लॉगिन करते ही वह यहाँ दिखेगा।',
     'अजून कोणताही डिलिव्हरी बॉय नाही. वरच्या सेटअप QR कोडने फोन जोडा — लॉगिन करताच तो इथे दिसेल.'],
    ['"Active" means the delivery man\'s phone checked in during the last 15 minutes. Phones connected with the setup QR code appear here by themselves once he logs in. Pending counts every open booking; delivered counts today\'s deliveries — from every phone.',
     '"सक्रिय" यानी पिछले 15 मिनट में उसका फ़ोन जुड़ा। सेटअप QR से जुड़े फ़ोन लॉगिन करते ही यहाँ अपने-आप दिखते हैं। बाकी में हर खुली बुकिंग गिनी जाती है; डिलीवर में आज की डिलीवरी — हर फ़ोन से।',
     '"सक्रिय" म्हणजे गेल्या 15 मिनिटांत त्याचा फोन जोडला गेला. सेटअप QR ने जोडलेले फोन लॉगिन करताच इथे आपोआप दिसतात. बाकीमध्ये प्रत्येक उघडी बुकिंग मोजली जाते; डिलिव्हरमध्ये आजच्या डिलिव्हरी — प्रत्येक फोनवरून.'],
    ['Log out','लॉगआउट','लॉगआउट'],
    ['The office has logged you out of this phone','ऑफिस ने इस फ़ोन से आपको लॉगआउट कर दिया','ऑफिसने या फोनवरून तुम्हाला लॉगआउट केले'],
    ['For: any delivery man','किसके लिए: कोई भी डिलीवरी मैन','कोणासाठी: कोणताही डिलिव्हरी बॉय'],
    ['Which delivery man gets these bookings','ये बुकिंग किस डिलीवरी मैन को मिलेंगी','या बुकिंग कोणत्या डिलिव्हरी बॉयला मिळतील'],
    ['◀ Previous','◀ पिछले','◀ मागील'],
    ['Next ▶','अगले ▶','पुढील ▶'],
    ['Customer name','ग्राहक का नाम','ग्राहकाचे नाव'],
    ['Address (optional)','पता (वैकल्पिक)','पत्ता (ऐच्छिक)'],
    ['e.g. Flat 12, Shanti Niwas, Naupada','जैसे: फ़्लैट 12, शांति निवास, नौपाडा','उदा. फ्लॅट 12, शांती निवास, नौपाडा'],
    ['If the customer is already saved at the office, the name and address fill in by themselves.','ग्राहक ऑफिस में सेव है तो नाम और पता अपने-आप भर जाएंगे।','ग्राहक ऑफिसमध्ये सेव्ह असेल तर नाव आणि पत्ता आपोआप भरले जातील.'],
    ['No booking for this number yet. Type the customer\'s name and add them.','इस नंबर की अभी कोई बुकिंग नहीं। ग्राहक का नाम लिखकर जोड़ें।','या नंबरची अजून बुकिंग नाही. ग्राहकाचे नाव लिहून जोडा.'],
    ['✅ Saved customer found. Tap Add customer to book them.','✅ सेव ग्राहक मिला। बुकिंग के लिए "ग्राहक जोड़ें" दबाएँ।','✅ सेव्ह ग्राहक सापडला. बुकिंगसाठी "ग्राहक जोडा" दाबा.'],
    ['➕ Add customer','➕ ग्राहक जोड़ें','➕ ग्राहक जोडा'],
    ['💾 Save','💾 सेव करें','💾 सेव्ह करा'],
    ['Saved','सेव हो गया','सेव्ह झाले'],
    ['Tap a number to see those bookings.','बुकिंग देखने के लिए किसी नंबर को दबाएँ।','बुकिंग पाहण्यासाठी कोणताही आकडा दाबा.'],
    ['No bookings here.','यहाँ कोई बुकिंग नहीं।','इथे कोणतीही बुकिंग नाही.'],
    ['⏳ Waiting for location','⏳ लोकेशन का इंतज़ार','⏳ लोकेशनची प्रतीक्षा'],
    ['📍 Location shared','📍 लोकेशन मिला','📍 लोकेशन मिळाले'],
    ['See these bookings','ये बुकिंग देखें','या बुकिंग पहा'],
    ['Loading…','लोड हो रहा है…','लोड होत आहे…'],
    ['Open on map','मैप पर खोलें','नकाशावर उघडा'],
    ['↪ Give to someone else','↪ किसी और को दें','↪ दुसऱ्याला द्या'],
    ['🏢 Return to office','🏢 ऑफिस को वापस दें','🏢 ऑफिसला परत द्या'],
    ['✖ Keep it','✖ मेरे पास रखें','✖ माझ्याकडे ठेवा'],
    ['No internet. Try again when online.','इंटरनेट नहीं है। इंटरनेट आने पर फिर करें।','इंटरनेट नाही. इंटरनेट आल्यावर पुन्हा करा.'],
    ['↪ 1 booking was moved by the office','↪ ऑफिस ने 1 बुकिंग हटा दी','↪ ऑफिसने 1 बुकिंग हलवली'],
    ['🔎 Find one customer\'s last 2 deliveries','🔎 एक ग्राहक की आख़िरी 2 डिलीवरी देखें','🔎 एका ग्राहकाच्या शेवटच्या 2 डिलिव्हरी पहा'],
    ['Mobile number or customer name','मोबाइल नंबर या ग्राहक का नाम','मोबाइल नंबर किंवा ग्राहकाचे नाव'],
    ['— or a report for dates —','— या तारीख़ों की रिपोर्ट —','— किंवा तारखांचा अहवाल —'],
    ['🟢 Last delivery','🟢 आख़िरी डिलीवरी','🟢 शेवटची डिलिव्हरी'],
    ['⚪ Before that','⚪ उससे पहले','⚪ त्याआधी'],
    ['No deliveries found for this customer.','इस ग्राहक की कोई डिलीवरी नहीं मिली।','या ग्राहकाची एकही डिलिव्हरी सापडली नाही.'],
    ['✅ Saved customer — tap Send link. The booking is added by itself.','✅ सेव ग्राहक — लिंक भेजें दबाएँ। बुकिंग अपने-आप जुड़ जाएगी।','✅ सेव्ह ग्राहक — लिंक पाठवा दाबा. बुकिंग आपोआप जोडली जाईल.'],
    ['Address','पता','पत्ता'],
    ['Dealer','डीलर','डीलर'],
    ['All saved customers','सभी सेव ग्राहक','सर्व सेव्ह ग्राहक'],
    ['Customers','ग्राहक','ग्राहक'],
    ['📵 Missing mobile number','📵 मोबाइल नंबर नहीं है','📵 मोबाइल नंबर नाही'],
    ['These customers were in your Excel with a name but no mobile number. Type the number and press 💾 Save — they move to Saved customers straight away. Or press ⬇ Download missing list, fill the Mobile Number column in Excel, and upload it again above.','इन ग्राहकों का Excel में नाम है पर मोबाइल नंबर नहीं। नंबर लिखकर 💾 सेव करें दबाएँ — वे तुरंत सेव ग्राहकों में चले जाएँगे। या ⬇ बाकी सूची डाउनलोड करें, Excel में मोबाइल नंबर भरें, और ऊपर फिर से अपलोड करें।','या ग्राहकांचे Excel मध्ये नाव आहे पण मोबाइल नंबर नाही. नंबर लिहून 💾 सेव्ह करा दाबा — ते लगेच सेव्ह ग्राहकांमध्ये जातील. किंवा ⬇ बाकी यादी डाउनलोड करा, Excel मध्ये मोबाइल नंबर भरा, आणि वर पुन्हा अपलोड करा.'],
    ['Find','खोजें','शोधा'],
    ['Customer photo','ग्राहक की फोटो','ग्राहकाचा फोटो'],
    ['Live photo','लाइव फोटो','लाइव्ह फोटो'],
    ['📷 = take with camera · 🖼️ = choose from gallery. The live photo is taken with the camera at the door.','📷 = कैमरे से फोटो · 🖼️ = गैलरी से चुनें। लाइव फोटो दरवाज़े पर कैमरे से लें।','📷 = कॅमेऱ्याने फोटो · 🖼️ = गॅलरीतून निवडा. लाइव्ह फोटो दारात कॅमेऱ्याने घ्या.'],
    ['Take a photo of the Aadhaar card (back).','आधार कार्ड (पीछे) की फोटो लें।','आधार कार्डचा (मागचा) फोटो घ्या.'],
    ['🆕 New connection','🆕 नया कनेक्शन','🆕 नवीन कनेक्शन'],
    ['← Back to Dashboard','← डैशबोर्ड पर वापस','← डॅशबोर्डवर परत'],
    ['🛢️ My fiber cylinder stock','🛢️ मेरे पास फाइबर सिलेंडर','🛢️ माझ्याकडील फायबर सिलिंडर'],
    ['cylinders with you','सिलेंडर आपके पास','सिलिंडर तुमच्याकडे'],
    ['Customer name','ग्राहक का नाम','ग्राहकाचे नाव'],
    ['Mobile number','मोबाइल नंबर','मोबाइल नंबर'],
    ['Address','पता','पत्ता'],
    ['Dealership','डीलरशिप','डीलरशिप'],
    ['📍 Use my location (stand at the door)','📍 मेरा लोकेशन लें (दरवाज़े पर खड़े रहें)','📍 माझे लोकेशन घ्या (दारात उभे रहा)'],
    ['Aadhaar card photo','आधार कार्ड की फोटो','आधार कार्डचा फोटो'],
    ['Front','आगे','पुढची बाजू'],
    ['Back','पीछे','मागची बाजू'],
    ['Cylinder number','सिलेंडर नंबर','सिलिंडर नंबर'],
    ['Money collected (₹)','लिए गए पैसे (₹)','घेतलेले पैसे (₹)'],
    ['✅ Save connection','✅ कनेक्शन सेव करें','✅ कनेक्शन सेव्ह करा'],
    ['My new connections','मेरे नए कनेक्शन','माझे नवीन कनेक्शन'],
    ['⏳ Waiting for office','⏳ ऑफिस की प्रतीक्षा','⏳ ऑफिसची वाट'],
    ['✅ Done','✅ हो गया','✅ झाले'],
    ['❌ Rejected','❌ अस्वीकार','❌ नाकारले'],
    ['None yet.','अभी कोई नहीं।','अजून काही नाही.'],
    ['✅ New connection saved','✅ नया कनेक्शन सेव हुआ','✅ नवीन कनेक्शन सेव्ह झाले'],
    ['Take a photo of the Aadhaar card (front).','आधार कार्ड (आगे) की फोटो लें।','आधार कार्डचा (पुढचा) फोटो घ्या.'],
    ['Aadhaar: type only the last 4 digits.','आधार: सिर्फ़ आखिरी 4 अंक लिखें।','आधार: फक्त शेवटचे 4 अंक लिहा.'],
    ["Enter the customer's name.",'ग्राहक का नाम लिखें।','ग्राहकाचे नाव लिहा.'],
    ['You have no fiber cylinders left. Ask the office for stock.','आपके पास फाइबर सिलेंडर नहीं बचे। ऑफिस से स्टॉक माँगें।','तुमच्याकडे फायबर सिलिंडर उरले नाहीत. ऑफिसकडे स्टॉक मागा.'],
    ['No stock with you — ask the office to give fiber cylinders.','आपके पास स्टॉक नहीं — ऑफिस से फाइबर सिलेंडर माँगें।','तुमच्याकडे स्टॉक नाही — ऑफिसकडे फायबर सिलिंडर मागा.'],
    ['Location not taken. Save without the location?','लोकेशन नहीं लिया। बिना लोकेशन सेव करें?','लोकेशन घेतले नाही. लोकेशनशिवाय सेव्ह करायचे?'],
    ['🗺️ See route on map','🗺️ नक्शे पर रूट देखें','🗺️ नकाशावर मार्ग पहा'],
    ['🔍 Find customer','🔍 ग्राहक खोजें','🔍 ग्राहक शोधा'],
    ['Name or mobile number','नाम या मोबाइल नंबर','नाव किंवा मोबाइल नंबर'],
    ['No booking found.','कोई बुकिंग नहीं मिली।','बुकिंग सापडली नाही.'],
    ['✅ Done','✅ हो गया','✅ झाले'],
    ['📍 no location','📍 लोकेशन नहीं','📍 लोकेशन नाही'],
    ['Map','नक्शा','नकाशा'],
    ["Today's map",'आज का नक्शा','आजचा नकाशा'],
    ['🚚 Next delivery','🚚 अगली डिलीवरी','🚚 पुढची डिलिव्हरी'],
    ['🧭 Go','🧭 जाएँ','🧭 जा'],
    ['📞 Call','📞 कॉल','📞 कॉल'],
    ['📲 Link','📲 लिंक','📲 लिंक'],
    ['⏭ Next customer','⏭ अगला ग्राहक','⏭ पुढचा ग्राहक'],
    ['🎉 All delivered','🎉 सब डिलीवर हो गया','🎉 सगळे डिलिव्हर झाले'],
    ['No bookings yet.','अभी कोई बुकिंग नहीं।','अजून बुकिंग नाही.'],
    ['📍 Location not shared yet','📍 लोकेशन अभी नहीं मिला','📍 लोकेशन अजून मिळाले नाही'],
    ['Undo','वापस लें','परत घ्या'],
    ['Undone — back on the route','वापस लिया — फिर से रूट पर','परत घेतले — पुन्हा रूटवर'],
    ['Customers the office has without a mobile number. When you meet one, ask for their number, type it and press 💾 Save — they become a normal customer straight away.','ऑफिस के वे ग्राहक जिनका मोबाइल नंबर नहीं है। ग्राहक मिले तो उसका नंबर पूछें, लिखें और 💾 सेव करें दबाएँ — वह तुरंत सामान्य ग्राहक बन जाएगा।','ऑफिसकडचे ग्राहक ज्यांचा मोबाइल नंबर नाही. ग्राहक भेटला की त्याचा नंबर विचारा, लिहा आणि 💾 सेव्ह करा दाबा — तो लगेच नेहमीचा ग्राहक होईल.'],
    ['📵 Show missing list','📵 नंबर-रहित सूची दिखाएँ','📵 नंबर नसलेली यादी दाखवा'],
    ['Name or address','नाम या पता','नाव किंवा पत्ता'],
    ['10-digit mobile','10 अंकों का मोबाइल','10 अंकी मोबाइल'],
    ['🎉 No one is missing a mobile number.','🎉 सबका मोबाइल नंबर है।','🎉 सगळ्यांचा मोबाइल नंबर आहे.'],
    ['No one matches that search.','इस खोज से कोई नहीं मिला।','या शोधात कोणी सापडले नाही.'],
    ['Could not load the list — check the internet and try again.','सूची नहीं खुली — इंटरनेट देखें और फिर कोशिश करें।','यादी उघडली नाही — इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.'],
    ['📲 Send location link','📲 लोकेशन लिंक भेजें','📲 लोकेशन लिंक पाठवा'],
    ['📋 Numbers filled — who filled them','📋 भरे गए नंबर — किसने भरे','📋 भरलेले नंबर — कोणी भरले'],
    ['When','कब','केव्हा'],
    ['Customer','ग्राहक','ग्राहक'],
    ['Filled by','किसने भरा','कोणी भरला'],
    ['Mobile number','मोबाइल नंबर','मोबाइल नंबर'],
    ['Dealer name','डीलर का नाम','डीलरचे नाव'],
    ['Name, address or dealer','नाम, पता या डीलर','नाव, पत्ता किंवा डीलर'],
    ['⬇ Download missing list','⬇ बाकी सूची डाउनलोड करें','⬇ बाकी यादी डाउनलोड करा'],
    ['Mobile number','मोबाइल नंबर','मोबाइल नंबर'],
    ['10-digit mobile','10 अंकों का मोबाइल','10 अंकी मोबाइल'],
    ['Remove from this list','इस सूची से हटाएँ','या यादीतून काढा'],
    ['Enter a valid 10-digit mobile number.','सही 10 अंकों का मोबाइल नंबर लिखें।','योग्य 10 अंकी मोबाइल नंबर लिहा.'],
    ['This number is a customer of more than one dealership — tap the dealership above.','यह नंबर एक से ज़्यादा डीलरशिप का ग्राहक है — ऊपर डीलरशिप चुनें।','हा नंबर एकापेक्षा जास्त डीलरशिपचा ग्राहक आहे — वर डीलरशिप निवडा.'],
    ['— choose one:','— एक चुनें:','— एक निवडा:'],
    ['— tap one:','— एक दबाएँ:','— एक दाबा:'],
    ['This number is a customer of','यह नंबर इतनी डीलरशिप का ग्राहक है:','हा नंबर इतक्या डीलरशिपचा ग्राहक आहे:'],
    ['🗑 Clear list','🗑 सूची साफ़ करें','🗑 यादी साफ करा'],
    ['Remove everyone from the missing-mobile list? Saved customers are not touched.','मोबाइल-नंबर-बाकी सूची से सबको हटाएँ? सेव ग्राहकों पर कोई असर नहीं।','मोबाइल नंबर नसलेल्या यादीतून सगळ्यांना काढायचे? सेव्ह ग्राहकांवर परिणाम होणार नाही.'],
    ['Missing-mobile list cleared','सूची साफ़ हो गई','यादी साफ झाली'],
    ['✖ Cancel selected','✖ चुनी हुई रद्द करें','✖ निवडलेल्या रद्द करा'],
    ['Clear selection','चयन हटाएँ','निवड काढा'],
    ['🔄 Move selected to…','🔄 चुनी हुई किसे दें…','🔄 निवडलेल्या कोणाला द्यायच्या…'],
    ['Select all','सब चुनें','सर्व निवडा'],
    ['⬇ Install GasDost on this phone','⬇ GasDost इस फ़ोन पर इंस्टॉल करें','⬇ GasDost या फोनवर इंस्टॉल करा'],
    ['⬇ Install','⬇ इंस्टॉल करें','⬇ इंस्टॉल करा'],
    ['📲 Install GasDost','📲 GasDost इंस्टॉल करें','📲 GasDost इंस्टॉल करा'],
    ['Open this page in Safari for this to work.','इसके लिए यह पेज Safari में खोलें।','यासाठी हे पेज Safari मध्ये उघडा.'],
    ['✅ Connected to the office','✅ ऑफिस से जुड़ा है','✅ ऑफिसशी जोडलेले आहे'],
    ['⚠️ Not connected to the office yet','⚠️ अभी ऑफिस से नहीं जुड़ा','⚠️ अजून ऑफिसशी जोडलेले नाही'],
    ['📷 Scan office QR','📷 ऑफिस का QR स्कैन करें','📷 ऑफिसचा QR स्कॅन करा'],
    ['or type the 6-digit code from the office screen:','या ऑफिस स्क्रीन का 6 अंकों का कोड लिखें:','किंवा ऑफिस स्क्रीनवरील 6 अंकी कोड लिहा:'],
    ['Connect','जोड़ें','जोडा'],
    ['Enter the 6-digit code from the office screen.','ऑफिस स्क्रीन का 6 अंकों का कोड लिखें।','ऑफिस स्क्रीनवरील 6 अंकी कोड लिहा.'],
    ['📷 Point at the QR code on the office screen','📷 ऑफिस स्क्रीन के QR कोड पर कैमरा रखें','📷 ऑफिस स्क्रीनवरील QR कोडवर कॅमेरा धरा'],
    ['Close','बंद करें','बंद करा'],
    ['That code is wrong or has expired. Ask the office for a new one.','यह कोड गलत है या पुराना हो गया। ऑफिस से नया कोड माँगें।','हा कोड चुकीचा आहे किंवा जुना झाला. ऑफिसकडून नवीन कोड मागा.'],
    ['Or type this code in the app:','या ऐप में यह कोड लिखें:','किंवा ॲपमध्ये हा कोड लिहा:'],
    ['🔄 New code','🔄 नया कोड','🔄 नवीन कोड'],
    ['✏️ Edit','✏️ बदलें','✏️ बदला'],
    ['Delete all','सब हटाएँ','सर्व काढा'],
    ['🗑 Recycle bin','🗑 रीसायकल बिन','🗑 रिसायकल बिन'],
    ['Deleted customers stay here for 30 days with their code, link and location. Press ♻️ Restore to bring them back. After 30 days they are removed for good.','हटाए गए ग्राहक 30 दिन यहाँ रहते हैं — कोड, लिंक और लोकेशन के साथ। ♻️ वापस लाएँ दबाएँ। 30 दिन बाद हमेशा के लिए हट जाते हैं।','काढलेले ग्राहक 30 दिवस इथे राहतात — कोड, लिंक आणि लोकेशनसह. ♻️ परत आणा दाबा. 30 दिवसांनंतर कायमचे काढले जातात.'],
    ['♻️ Restore','♻️ वापस लाएँ','♻️ परत आणा'],
    ['♻️ Restore all','♻️ सब वापस लाएँ','♻️ सर्व परत आणा'],
    ['📜 Delete history','📜 हटाने का इतिहास','📜 काढल्याचा इतिहास'],
    ['🔑 Change Delete PIN','🔑 डिलीट पिन बदलें','🔑 डिलीट पिन बदला'],
    ['Delete PIN','डिलीट पिन','डिलीट पिन'],
    ['Deleted','हटाया','काढले'],
    ['Delete','हटाएँ','काढा'],
    ['Cancel','रद्द करें','रद्द करा'],
    ['Enter the Delete PIN.','डिलीट पिन लिखें।','डिलीट पिन लिहा.'],
    ['Type DELETE to confirm.','पक्का करने के लिए DELETE लिखें।','खात्रीसाठी DELETE लिहा.'],
    ['🔎 Type a name, mobile number, address, dealer or code above to find a customer.','🔎 ग्राहक खोजने के लिए ऊपर नाम, मोबाइल नंबर, पता, डीलर या कोड लिखें।','🔎 ग्राहक शोधण्यासाठी वर नाव, मोबाइल नंबर, पत्ता, डीलर किंवा कोड लिहा.'],
    ['📍 Location tracker','📍 लोकेशन ट्रैकर','📍 लोकेशन ट्रॅकर'],
    ["Follows each booking's location link: sent → opened by the customer → location pinned. A booking is ✅ complete only once its location is pinned. Tap any number to see those customers.",'हर बुकिंग का लोकेशन लिंक: भेजा → ग्राहक ने खोला → लोकेशन पिन हुआ। बुकिंग ✅ पूरी तभी मानी जाती है जब लोकेशन पिन हो जाए। ग्राहक देखने के लिए किसी भी नंबर को दबाएँ।','प्रत्येक बुकिंगची लोकेशन लिंक: पाठवली → ग्राहकाने उघडली → लोकेशन पिन झाले. लोकेशन पिन झाल्यावरच बुकिंग ✅ पूर्ण मानली जाते. ग्राहक पाहण्यासाठी कोणताही आकडा दाबा.'],
    ['Bookings','बुकिंग','बुकिंग'],
    ['Current bookings','अभी की बुकिंग','सध्याच्या बुकिंग'],
    ['Booked today','आज की बुकिंग','आजच्या बुकिंग'],
    ['Booked in the last 7 days','पिछले 7 दिनों की बुकिंग','मागील 7 दिवसांच्या बुकिंग'],
    ['Booked this month','इस महीने की बुकिंग','या महिन्याच्या बुकिंग'],
    ['📤 Link sent','📤 लिंक भेजा','📤 लिंक पाठवली'],
    ['📤 Sent','📤 भेजा','📤 पाठवली'],
    ['👀 Link opened','👀 लिंक खोला','👀 लिंक उघडली'],
    ['👀 Opened','👀 खोला','👀 उघडली'],
    ['✅ Pinned — complete','✅ पिन हुआ — पूरा','✅ पिन झाले — पूर्ण'],
    ['✅ Pinned via link','✅ लिंक से पिन','✅ लिंकने पिन'],
    ['📍 Pinned other ways','📍 दूसरे तरीके से पिन','📍 इतर मार्गाने पिन'],
    ['⏳ Sent, not pinned','⏳ भेजा, पिन नहीं हुआ','⏳ पाठवली, पिन नाही'],
    ['✉️ Link not sent yet','✉️ लिंक अभी नहीं भेजा','✉️ लिंक अजून पाठवली नाही'],
    ['✉️ Not sent','✉️ नहीं भेजा','✉️ पाठवली नाही'],
    ['and not pinned','और पिन नहीं','आणि पिन नाही'],
    ['Complete','पूरा','पूर्ण'],
    ['🏠 Doorsteps saved','🏠 सेव पते','🏠 सेव्ह पत्ते'],
    ['Link sent','लिंक भेजा','लिंक पाठवली'],
    ['Opened','खोला','उघडली'],
    ['Location','लोकेशन','लोकेशन'],
    ['Not sent','नहीं भेजा','पाठवली नाही'],
    ['⏳ Not pinned','⏳ पिन नहीं','⏳ पिन नाही'],
    ['📤 Send link','📤 लिंक भेजें','📤 लिंक पाठवा'],
    ['All bookings','सारी बुकिंग','सर्व बुकिंग'],
    ['Nothing to download','डाउनलोड के लिए कुछ नहीं','डाउनलोडसाठी काही नाही'],
    ['📍 Waiting for location','📍 लोकेशन का इंतज़ार','📍 लोकेशनची प्रतीक्षा'],
    ['📤 Resend link','📤 लिंक फिर भेजें','📤 लिंक पुन्हा पाठवा'],
    ['👋 Logged out','👋 लॉगआउट','👋 लॉगआउट'],
    ['👋 Logged out today','👋 आज लॉगआउट हुए','👋 आज लॉगआउट झालेले'],
    ['🗑 Remove','🗑 हटाएँ','🗑 काढा'],
    ['◀ Previous code','◀ पिछला कोड','◀ मागील कोड'],
    ['Next code ▶','अगला कोड ▶','पुढचा कोड ▶'],
    ['Tip: turn the screen brightness up, and hold the phone 20–30 cm away so the whole code fits in the box.','सुझाव: स्क्रीन की रोशनी बढ़ाएँ, और फ़ोन 20–30 सेमी दूर रखें ताकि पूरा कोड डिब्बे में आए।','टीप: स्क्रीनचा प्रकाश वाढवा, आणि फोन 20–30 सेमी दूर धरा म्हणजे पूर्ण कोड चौकटीत येईल.'],
    ['🖼️ Scan from a photo instead','🖼️ फ़ोटो से स्कैन करें','🖼️ फोटोवरून स्कॅन करा'],
    ["If the camera doesn't catch it: ask the office to turn the screen brightness up, hold the phone 20–30 cm away, or take a photo of the code.",'अगर कैमरा न पकड़े: ऑफिस से स्क्रीन की रोशनी बढ़ाने को कहें, फ़ोन 20–30 सेमी दूर रखें, या कोड का फ़ोटो लें।','कॅमेरा पकडत नसेल तर: ऑफिसला स्क्रीनचा प्रकाश वाढवायला सांगा, फोन 20–30 सेमी दूर धरा, किंवा कोडचा फोटो घ्या.'],
    ['No QR code found in that photo. Take it closer and straight on, with the whole code in the picture.','इस फ़ोटो में QR कोड नहीं मिला। पास से और सीधा फ़ोटो लें, पूरा कोड फ़ोटो में आए।','या फोटोत QR कोड सापडला नाही. जवळून आणि सरळ फोटो घ्या, पूर्ण कोड फोटोत यायला हवा.'],
    ['Customers who have not sent their location yet','जिन ग्राहकों ने अभी लोकेशन नहीं भेजा','ज्या ग्राहकांनी अजून लोकेशन पाठवले नाही'],
    ['🏪 By dealership','🏪 डीलरशिप के अनुसार','🏪 डीलरशिपनुसार'],
    ['🚚 By delivery man','🚚 डिलीवरी मैन के अनुसार','🚚 डिलिव्हरी बॉयनुसार'],
    ['No dealership','कोई डीलरशिप नहीं','डीलरशिप नाही'],
    ['Total','कुल','एकूण'],
    ['Dealership','डीलरशिप','डीलरशिप'],
    ['All dealerships','सभी डीलरशिप','सर्व डीलरशिप'],
    ['📅 Delivered history','📅 डिलीवरी का इतिहास','📅 डिलिव्हरीचा इतिहास'],
    ['Every delivery is kept here, even after it leaves the delivery man\'s phone at midnight. Pick the dates and a delivery man, then see the list or download it as Excel.','हर डिलीवरी यहाँ सुरक्षित रहती है, रात 12 बजे डिलीवरी मैन के फ़ोन से हटने के बाद भी। तारीख़ और डिलीवरी मैन चुनें, फिर सूची देखें या Excel में डाउनलोड करें।','प्रत्येक डिलिव्हरी इथे जपून ठेवली जाते, रात्री 12 वाजता डिलिव्हरी बॉयच्या फोनवरून निघाल्यानंतरही. तारखा आणि डिलिव्हरी बॉय निवडा, मग यादी पहा किंवा Excel मध्ये डाउनलोड करा.'],
    ['From','से','पासून'],
    ['To','तक','पर्यंत'],
    ['Delivery man','डिलीवरी मैन','डिलिव्हरी बॉय'],
    ['Everyone','सभी','सर्व'],
    ['🔍 Show','🔍 दिखाएँ','🔍 दाखवा'],
    ['⬇ Download Excel','⬇ Excel डाउनलोड करें','⬇ Excel डाउनलोड करा'],
    ['Today','आज','आज'],
    ['Yesterday','कल','काल'],
    ['Last 7 days','पिछले 7 दिन','मागील 7 दिवस'],
    ['This month','इस महीने','या महिन्यात'],
    ['Last month','पिछले महीने','मागील महिन्यात'],
    ['Delivered at','डिलीवरी का समय','डिलिव्हरीची वेळ'],
    ['Delivered by','किसने डिलीवर किया','कोणी डिलिव्हर केले'],
    ['Choose a date first','पहले तारीख़ चुनें','आधी तारीख निवडा'],
    ['No deliveries for these dates','इन तारीख़ों में कोई डिलीवरी नहीं','या तारखांना एकही डिलिव्हरी नाही'],
    ['👉 Choose delivery man','👉 डिलीवरी मैन चुनें','👉 डिलिव्हरी बॉय निवडा'],
    ['Choose a delivery man first','पहले डिलीवरी मैन चुनें','आधी डिलिव्हरी बॉय निवडा'],
    ['For: any delivery man (everyone sees it)','किसके लिए: कोई भी डिलीवरी मैन (सबको दिखेगी)','कोणासाठी: कोणताही डिलिव्हरी बॉय (सगळ्यांना दिसेल)'],
    ['🔄 Move to…','🔄 किसे दें…','🔄 कोणाला द्यायची…'],
    ['🏢 Office (hold)','🏢 ऑफिस (रोकें)','🏢 ऑफिस (थांबवा)'],
    ['Any delivery man','कोई भी डिलीवरी मैन','कोणताही डिलिव्हरी बॉय'],
    ['✖ Cancel','✖ रद्द करें','✖ रद्द करा'],
    ['Change','बदलें','बदला'],
    ['🏢 With office','🏢 ऑफिस के पास','🏢 ऑफिसकडे'],
    ['🏢 Office','🏢 ऑफिस','🏢 ऑफिस'],
    ['Connect to the online database first','पहले ऑनलाइन डेटाबेस से जोड़ें','आधी ऑनलाइन डेटाबेसशी जोडा'],
  ];

  // Whole strings with a changing part. $1, $2 are kept as they are.
  const P = [
    [/^Logged in as (.+)$/, '$1 के नाम से लॉगिन', '$1 म्हणून लॉगिन'],
    [/^(\d+) bookings?$/, '$1 बुकिंग', '$1 बुकिंग'],
    [/^(\d+) of (\d+) delivery men active$/, '$2 में से $1 डिलीवरी मैन सक्रिय', '$2 पैकी $1 डिलिव्हरी बॉय सक्रिय'],
    [/^(\d+) of (\d+) sent$/, '$2 में से $1 भेजे', '$2 पैकी $1 पाठवले'],
    [/^(\d+) saved customers?$/, '$1 सेव ग्राहक', '$1 सेव्ह ग्राहक'],
    [/^(\d+) customers?$/, '$1 ग्राहक', '$1 ग्राहक'],
    [/^(\d+) match(?:es)?$/, '$1 मिले', '$1 सापडले'],
    [/^Showing (\d+) of (\d+)$/, '$2 में से $1 दिख रहे', '$2 पैकी $1 दिसत आहेत'],
    [/^📍 (\d+) customers shared their location$/, '📍 $1 ग्राहकों ने लोकेशन भेजा', '📍 $1 ग्राहकांनी लोकेशन पाठवले'],
    [/^📍 (.+) shared their location$/, '📍 $1 ने लोकेशन भेजा', '📍 $1 यांनी लोकेशन पाठवले'],
    [/^(.+) shared their location$/, '$1 ने लोकेशन भेजा', '$1 यांनी लोकेशन पाठवले'],
    [/^(\d+) new customer locations? received$/, '$1 नए ग्राहक लोकेशन आए', '$1 नवीन ग्राहक लोकेशन आले'],
    [/^Location saved for (.+)$/, '$1 का लोकेशन सेव हुआ', '$1 चे लोकेशन सेव्ह झाले'],
    [/^Marked delivered for (.+)$/, '$1 — डिलीवर हुआ', '$1 — डिलिव्हर झाले'],
    [/^Booking added for consumer (.+)$/, '$1 की बुकिंग जुड़ी', '$1 ची बुकिंग जोडली'],
    [/^No booking found for (.+)$/, '$1 की कोई बुकिंग नहीं मिली', '$1 ची बुकिंग सापडली नाही'],
    [/^WhatsApp opened with prefilled message for (.+)$/, '$1 के लिए WhatsApp मैसेज तैयार', '$1 साठी WhatsApp मेसेज तयार'],
    [/^Added (.+) to batch$/, '$1 बैच में जुड़ा', '$1 बॅचमध्ये जोडला'],
    [/^Removed (.+)$/, '$1 हटाया', '$1 काढला'],
    [/^Remove (.+) from the customer list\?$/, '$1 को ग्राहक सूची से हटाएँ?', '$1 ला ग्राहक यादीतून काढायचे?'],
    [/^Delete all (\d+) saved customers\? Export to Excel first if you want a copy\.$/, 'सारे $1 सेव ग्राहक हटाएँ? कॉपी चाहिए तो पहले Excel में निकालें।', 'सर्व $1 सेव्ह ग्राहक काढायचे? कॉपी हवी असल्यास आधी Excel मध्ये काढा.'],
    [/^Link sent to (.+)$/, '$1 को लिंक भेजा', '$1 ला लिंक पाठवला'],
    [/^Copied (\d+) links$/, '$1 लिंक कॉपी हुए', '$1 लिंक कॉपी झाल्या'],
    [/^(\d+) deliver(?:y|ies)$/, '$1 डिलीवरी', '$1 डिलिव्हरी'],
    [/^Exported (\d+) deliveries$/, '$1 डिलीवरी Excel में निकालीं', '$1 डिलिव्हरी Excel मध्ये काढल्या'],
    [/^Exported (\d+) (.+)$/, '$1 निकाले गए', '$1 काढले'],
    [/^Imported (\d+) (.+)$/, '$1 जोड़े गए', '$1 जोडले'],
    [/^⚪ (\d+) min ago$/, '⚪ $1 मिनट पहले', '⚪ $1 मिनिटांपूर्वी'],
    [/^⚪ (\d+) hr ago$/, '⚪ $1 घंटे पहले', '⚪ $1 तासांपूर्वी'],
    [/^✓ Sent (.+)$/, '✓ भेजा $1', '✓ पाठवले $1'],
    [/^👤 (.+)$/, '👤 $1', '👤 $1'],
    [/^Log (.+) out of the delivery app\? .*$/, '$1 को डिलीवरी ऐप से लॉगआउट करें? उसका फ़ोन एक मिनट में लॉगिन स्क्रीन पर आ जाएगा। उसकी बुकिंग सुरक्षित रहेंगी।', '$1 ला डिलिव्हरी ॲपमधून लॉगआउट करायचे? त्याचा फोन एका मिनिटात लॉगिन स्क्रीनवर येईल. त्याच्या बुकिंग सुरक्षित राहतील.'],
    [/^(.+) logged out$/, '$1 लॉगआउट हुआ', '$1 लॉगआउट झाला'],
    [/^↪ (\d+) bookings were moved by the office$/, '↪ ऑफिस ने $1 बुकिंग हटा दीं', '↪ ऑफिसने $1 बुकिंग हलवल्या'],
    [/^↪ (.+) → the office$/, '↪ $1 → ऑफिस', '↪ $1 → ऑफिस'],
    [/^Booking (\d+) moved to (.+)$/, 'बुकिंग $1 → $2', 'बुकिंग $1 → $2'],
    [/^Booking (\d+) cancelled$/, 'बुकिंग $1 रद्द हुई', 'बुकिंग $1 रद्द झाली'],
    [/^Cancel the booking for (\d+)\? .*$/, '$1 की बुकिंग रद्द करें? एक मिनट में डिलीवरी मैन के फ़ोन से हट जाएगी।', '$1 ची बुकिंग रद्द करायची? एका मिनिटात डिलिव्हरी बॉयच्या फोनवरून निघून जाईल.'],
    [/^For: (.+)$/, 'किसके लिए: $1', 'कोणासाठी: $1'],
    [/^Waiting for location — (.+)$/, 'लोकेशन का इंतज़ार — $1', 'लोकेशनची प्रतीक्षा — $1'],
    [/^Code (\d+) of (\d+)$/, 'कोड $1 / $2', 'कोड $1 / $2'],
    [/^Code (\d+) of (\d+) done$/, 'कोड $1 / $2 हो गया', 'कोड $1 / $2 झाला'],
    [/^✅ Code (\d+) of (\d+) done \((\d+) new\)\. .*$/, '✅ कोड $1 / $2 हो गया ($3 नई)। ऑफिस से अगला कोड दिखाने को कहें और कैमरा उस पर रखें।', '✅ कोड $1 / $2 झाला ($3 नवीन). ऑफिसला पुढचा कोड दाखवायला सांगा आणि कॅमेरा त्यावर ठेवा.'],
    [/^✅ All done — (\d+) new bookings? added\.$/, '✅ सब हो गया — $1 नई बुकिंग जुड़ीं।', '✅ सगळे झाले — $1 नवीन बुकिंग जोडल्या.'],
    [/^This batch will be split into (\d+) QR codes of up to (\d+) bookings each.*$/, 'यह बैच $1 QR कोड में बँटेगा, हर कोड में $2 तक बुकिंग — डिलीवरी मैन एक के बाद एक स्कैन करे।', 'हा बॅच $1 QR कोडमध्ये विभागला जाईल, प्रत्येकी $2 पर्यंत बुकिंग — डिलिव्हरी बॉयने एकामागून एक स्कॅन करावे.'],
    [/^Remove (.+) from Delivery status\?.*$/, '$1 को डिलीवरी स्टेटस से हटाएँ? उसकी बाकी बुकिंग 🏢 ऑफिस में जाएँगी। वह फिर लॉगिन करे तो वापस आ जाएगा।', '$1 ला डिलिव्हरी स्टेटसमधून काढायचे? त्याच्या बाकी बुकिंग 🏢 ऑफिसकडे जातील. तो पुन्हा लॉगिन केल्यास परत येईल.'],
    [/^(.+) removed(?: — (\d+) bookings? moved to office)?$/, '$1 हटाया गया', '$1 काढला'],
    [/^(\d+)% of customers$/, '$1% ग्राहक', '$1% ग्राहक'],
    [/^(?:First 5,000 )?([\d,]+) customers?$/, '$1 ग्राहक', '$1 ग्राहक'],
    [/^Delivered ✓ (.+)$/, 'डिलीवर ✓ $1', 'डिलिव्हर ✓ $1'],
    [/^\+(\d+) more — type more letters$/, '+$1 और — और अक्षर लिखें', '+$1 अजून — अजून अक्षरे लिहा'],
    [/^(\d+) left$/, '$1 बाकी', '$1 बाकी'],
    [/^Saved — (.+) is now a customer$/, 'सेव हुआ — $1 अब ग्राहक है', 'सेव्ह झाले — $1 आता ग्राहक आहे'],
    [/^This number is already saved for (.+) at this dealership\. Check the number, or ask the office\.(\n📍 [\s\S]*)?$/, 'यह नंबर इस डीलरशिप में पहले से $1 के नाम है। नंबर जाँचें या ऑफिस से पूछें।$2', 'हा नंबर या डीलरशिपमध्ये आधीच $1 च्या नावावर आहे. नंबर तपासा किंवा ऑफिसला विचारा.$2'],
    [/^All dealerships \(([\d,]+)\)$/, 'सभी डीलरशिप ($1)', 'सर्व डीलरशिप ($1)'],
    [/^([\d,]+) waiting for a mobile number$/, '$1 मोबाइल नंबर के इंतज़ार में', '$1 मोबाइल नंबरच्या प्रतीक्षेत'],
    [/^Saved (.+) — \+91 (\d+)$/, '$1 सेव हुआ — +91 $2', '$1 सेव्ह झाले — +91 $2'],
    [/^(\d+) selected$/, '$1 चुनी', '$1 निवडल्या'],
    [/^(\d+) bookings? cancelled$/, '$1 बुकिंग रद्द हुईं', '$1 बुकिंग रद्द झाल्या'],
    [/^(\d+) bookings? moved to (.+)$/, '$1 बुकिंग → $2', '$1 बुकिंग → $2'],
    [/^Cancel (\d+) bookings?\? .*$/, '$1 बुकिंग रद्द करें? एक मिनट में डिलीवरी मैन के फ़ोन से हट जाएँगी।', '$1 बुकिंग रद्द करायच्या? एका मिनिटात डिलिव्हरी बॉयच्या फोनवरून निघून जातील.'],
    [/^Works for (\d+:\d+) more$/, 'अभी $1 चलेगा', 'अजून $1 चालेल'],
    [/^✅ Saved customer: (.+)$/, '✅ सेव ग्राहक: $1', '✅ सेव्ह ग्राहक: $1'],
    [/^(\d+)% of bookings$/, '$1% बुकिंग', '$1% बुकिंग'],
    [/^(\d+)% of sent$/, 'भेजे में से $1%', 'पाठवलेल्यांपैकी $1%'],
    [/^(\d+)% of sent links pinned$/, 'भेजे लिंक में से $1% पिन', 'पाठवलेल्या लिंकपैकी $1% पिन'],
    [/^(\d+) via link · (\d+) other ways$/, '$1 लिंक से · $2 दूसरे तरीके', '$1 लिंकने · $2 इतर मार्गाने'],
    [/^🏠 Doorsteps saved: ([\d,]+) of ([\d,]+) customers \((\d+)%\)$/, '🏠 सेव पते: $2 में से $1 ग्राहक ($3%)', '🏠 सेव्ह पत्ते: $2 पैकी $1 ग्राहक ($3%)'],
    [/^📍 Pinned \((.+)\)$/, '📍 पिन हुआ', '📍 पिन झाले'],
    [/^by (.+)$/, '$1 ने', '$1 कडून'],
    [/^Pending — (.+)$/, 'बाकी — $1', 'बाकी — $1'],
    [/^Delivered today — (.+)$/, 'आज डिलीवर हुईं — $1', 'आज डिलिव्हर झाल्या — $1'],
    [/^All bookings — (.+)$/, 'सारी बुकिंग — $1', 'सर्व बुकिंग — $1'],
    [/^✅ Delivered (\d{1,2}:\d{2}.*)$/, '✅ डिलीवर $1', '✅ डिलिव्हर $1'],
    [/^Showing ([\d,]+)–([\d,]+) of ([\d,]+)$/, '$3 में से $1–$2', '$3 पैकी $1–$2'],
    [/^⏳ Saving… ([\d,]+) of ([\d,]+)\. Please keep this page open\.$/, '⏳ सेव हो रहा है… $2 में से $1। पेज खुला रखें।', '⏳ सेव्ह होत आहे… $2 पैकी $1. पेज उघडे ठेवा.'],
    [/^Uploaded (\d+) bookings? for (.+)\. They reach his phone within 30 seconds\.$/, '$2 के लिए $1 बुकिंग अपलोड हुईं। 30 सेकंड में उसके फ़ोन पर पहुँचेंगी।', '$2 साठी $1 बुकिंग अपलोड झाल्या. 30 सेकंदात त्याच्या फोनवर पोहोचतील.'],
  ];

  // Pieces inside longer lines (e.g. "9810… · BK-… · 6 min ago · 11:16").
  const PART = [
    ['— not shared yet —', '— अभी लोकेशन नहीं आया —', '— अजून लोकेशन आले नाही —'],
    [' min ago', ' मिनट पहले', ' मिनिटांपूर्वी'],
    [' hr ago', ' घंटे पहले', ' तासांपूर्वी'],
    ['just now', 'अभी-अभी', 'आत्ताच'],
  ];

  const norm = s => s.replace(/\s+/g, ' ').trim();
  const DICT = {hi: new Map(), mr: new Map()};
  T.forEach(([en, hi, mr]) => { DICT.hi.set(norm(en), hi); DICT.mr.set(norm(en), mr); });

  let lang = 'en';
  try{ lang = localStorage.getItem(LANG_KEY) || 'en'; }catch(e){}
  if(!['en','hi','mr'].includes(lang)) lang = 'en';

  // Translate one English string into the current language.
  function tr(en){
    if(lang === 'en' || !en) return en;
    const lead = en.match(/^\s*/)[0], tail = en.match(/\s*$/)[0];
    const core = norm(en);
    if(!core || !/[A-Za-z]/.test(core)) return en;
    const d = DICT[lang];
    const col = lang === 'hi' ? 1 : 2;
    let out = d.get(core);
    if(out === undefined){
      // Same line with an emoji or symbol in front?
      const m = core.match(/^([^A-Za-z"'(]+)(.+)$/);
      if(m && d.has(m[2])) out = m[1] + d.get(m[2]);
    }
    if(out === undefined){
      for(const p of P){
        if(p[0].test(core)){ out = core.replace(p[0], p[col]); break; }
      }
    }
    if(out === undefined){
      let s = core, hit = false;
      for(const p of PART){ if(s.includes(p[0])){ s = s.split(p[0]).join(p[col]); hit = true; } }
      if(hit) out = s;
    }
    return out === undefined ? en : lead + out + tail;
  }

  // ---- applying it to the page ----
  const textState = new WeakMap();   // text node → {en, shown}
  const attrState = new WeakMap();   // element → {placeholder:{en,shown}, title:{...}}
  const ATTRS = ['placeholder', 'title'];

  function skipped(el){
    return !el || el.closest('script,style,textarea,[data-noi18n],.leaflet-tile-container');
  }
  function doText(n){
    const el = n.parentElement;
    if(skipped(el)) return;
    const cur = n.nodeValue;
    const st = textState.get(n);
    const en = (st && cur === st.shown) ? st.en : cur;
    const out = tr(en);
    if(out !== cur) n.nodeValue = out;
    textState.set(n, {en, shown: out});
  }
  function doAttrs(el){
    if(skipped(el)) return;
    let st = attrState.get(el);
    for(const a of ATTRS){
      if(!el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a);
      st = st || {};
      const s = st[a];
      const en = (s && cur === s.shown) ? s.en : cur;
      const out = tr(en);
      if(out !== cur) el.setAttribute(a, out);
      st[a] = {en, shown: out};
    }
    if(st) attrState.set(el, st);
  }
  function walk(root){
    if(!root) return;
    if(root.nodeType === 3){ doText(root); return; }
    if(root.nodeType !== 1) return;
    doAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n;
    while((n = w.nextNode())){ n.nodeType === 3 ? doText(n) : doAttrs(n); }
  }

  let observer = null;
  function watch(){
    if(observer) return;
    observer = new MutationObserver(list => {
      for(const m of list){
        if(m.type === 'characterData') doText(m.target);
        else if(m.type === 'attributes') doAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTRS});
  }

  // Pop-up boxes the apps open themselves.
  ['alert', 'confirm', 'prompt'].forEach(fn => {
    const orig = window[fn].bind(window);
    window[fn] = (msg, ...rest) => orig(tr(String(msg == null ? '' : msg)), ...rest);
  });

  // ---- the switch ----
  function setLang(l){
    if(!['en','hi','mr'].includes(l)) return;
    lang = l;
    try{ localStorage.setItem(LANG_KEY, l); }catch(e){}
    document.documentElement.lang = l;
    walk(document.body);
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  }

  function mount(slot, big){
    if(!slot || slot.querySelector('.lang-switch')) return;
    const box = document.createElement('div');
    box.className = 'lang-switch' + (big ? ' big' : '');
    box.setAttribute('data-noi18n', '');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Language / भाषा');
    LANGS.forEach(([code, full, short]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = code;
      b.textContent = big ? full : short;
      b.title = full;
      b.onclick = () => setLang(code);
      if(code === lang) b.classList.add('on');
      box.appendChild(b);
    });
    slot.appendChild(box);
  }

  const css = document.createElement('style');
  css.textContent =
    '.lang-switch{display:inline-flex;background:rgba(255,255,255,.18);border-radius:9px;padding:2px;gap:2px;}' +
    '.lang-switch button{border:none;background:transparent;color:#fff;font-weight:700;font-size:12.5px;padding:5px 8px;border-radius:7px;cursor:pointer;line-height:1.2;}' +
    '.lang-switch button.on{background:#fff;color:#c62828;}' +
    '.lang-switch.big{display:flex;width:100%;background:#f1f3f6;padding:4px;border-radius:12px;margin:0 0 16px;}' +
    '.lang-switch.big button{flex:1;color:#1c2530;font-size:15px;padding:10px 4px;}' +
    '.lang-switch.big button.on{background:#c62828;color:#fff;}';
  document.head.appendChild(css);

  function start(){
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-slot]').forEach(s => mount(s, s.dataset.langSlot === 'big'));
    if(lang !== 'en') walk(document.body);
    watch();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.GDI18N = { setLang, tr, get lang(){ return lang; } };
})();
