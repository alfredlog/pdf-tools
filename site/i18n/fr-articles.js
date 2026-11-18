// Articles SEO en français sous chaque outil : slug -> [[titre, paragraphe, paragraphe …], …]
module.exports = {
  bewerbungsmappe: [
    ["Pourquoi un seul PDF ?", "Les services RH et les portails de candidature attendent généralement un seul fichier PDF, et beaucoup n’acceptent que 2 ou 5 Mo. Avec cet outil, plus besoin de jongler entre Word, une application de scan et un site de compression : tout est fusionné, trié et allégé en une seule étape."],
    ["Le bon ordre des documents de candidature", "Un ordre qui a fait ses preuves : page de garde (facultative), lettre de motivation, CV, puis les certificats – le certificat de travail le plus récent d’abord, ensuite diplômes et bulletins scolaires – et pour finir attestations et justificatifs. Donnez des noms parlants à vos fichiers (ex. « CV » plutôt que « Scan_0042 »), car ils apparaissent dans le sommaire de la page de garde."],
    ["Créer son dossier de candidature en ligne – pour tout type de candidature", "Apprentissage, stage, job étudiant, job à temps partiel, études en alternance ou CDI : un dossier de candidature complet en un seul PDF est aujourd’hui la norme. Pour une candidature spontanée, une admission à l’université ou une bourse, il faut aussi le plus souvent un seul PDF clair.", "L’outil de PDF Libre fonctionne entièrement en ligne dans votre navigateur – sur PC, Mac, tablette et téléphone. Aucun logiciel à installer, aucun compte à créer."],
    ["Que contient un dossier de candidature ?", "La lettre de motivation et le CV sont obligatoires. Ajoutez les justificatifs adaptés au poste : certificats de travail, diplômes, dernier bulletin scolaire (surtout pour un apprentissage), certificats de langue, formations et attestations de stage. Une page de garde et une page de motivation complémentaire sont facultatives."],
  ],
  merge: [
    ["Quand est-il utile de fusionner des PDF ?", "Candidatures, documents fiscaux, factures ou scans se composent souvent de nombreux fichiers séparés. Un seul PDF est plus facile à envoyer, s’imprime d’un coup et ne se perd pas parmi les pièces jointes. Beaucoup de portails en ligne n’acceptent d’ailleurs qu’un fichier par envoi.", "Exemple typique : le dossier de candidature. Lettre de motivation, CV et diplômes sont créés en PDF séparés, puis réunis en un seul document."],
    ["Que deviennent le contenu et la qualité ?", "Lors de la fusion, les pages sont seulement réordonnées, pas recalculées. Le texte reste cherchable, les images gardent leur résolution et les liens fonctionnent toujours. Le format de chaque page est conservé – une page paysage reste en paysage.", "Si le fichier final est trop lourd pour l’e-mail, utilisez ensuite « Compresser PDF », ou directement « Fusionner et compresser »."],
  ],
  split: [
    ["Bien indiquer les plages de pages", "Séparez les plages par des virgules. « 1-3 » signifie pages 1 à 3, un nombre seul désigne une seule page. « 1-3, 4-6, 7 » donne donc trois fichiers. Les plages peuvent se chevaucher si une page doit figurer dans plusieurs parties.", "Pour sortir seulement quelques pages, « Extraire des pages » est souvent plus rapide : il suffit de cliquer sur les pages dans l’aperçu."],
    ["Pourquoi dans le navigateur ?", "Diviser un PDF ne nécessite pas de recalculer son contenu, votre navigateur peut donc le faire lui-même. Le PDF n’est jamais envoyé sur notre serveur. C’est plus rapide – et la solution la plus sûre pour des documents confidentiels comme des contrats ou des relevés bancaires."],
  ],
  organize: [
    ["Remettre de l’ordre dans des documents scannés", "Avec un scanner à chargeur, les pages se retrouvent vite dans le désordre ou à l’envers. Dans la vue des pages, vous voyez tout de suite ce qui ne va pas et le corrigez directement, sans rescanner le document."],
    ["Conseils pour les longs documents", "Avec beaucoup de pages, il vaut mieux supprimer d’abord, puis trier. Pour combiner des pages de plusieurs fichiers, fusionnez-les d’abord avec « Fusionner PDF », puis organisez le résultat."],
  ],
  rotate: [
    ["Pivoter durablement, pas seulement à l’affichage", "Beaucoup de lecteurs PDF ne font pivoter les pages qu’à l’affichage – à la prochaine ouverture, ou chez le destinataire, la page est de nouveau de travers. Ici, l’orientation est enregistrée dans le fichier et vaut partout : à l’écran, à l’impression et sur téléphone."],
  ],
  "remove-pages": [
    ["Cas d’usage typiques", "Les documents scannés contiennent souvent des versos blancs, les présentations des diapositives inutiles pour un destinataire précis, et les relevés bancaires des pages de publicité. Au lieu de recréer le fichier, vous retirez précisément les pages en trop."],
    ["Sélection par clic ou par numéro", "Les pages marquées sont encadrées en rouge. Pour les longs documents, la saisie est plus rapide : « 2, 5-7 » supprime les pages 2, 5, 6 et 7. Les deux méthodes peuvent être combinées."],
  ],
  "extract-pages": [
    ["Extraire ou diviser ?", "En extrayant, vous choisissez des pages précises – par exemple la page de signature d’un contrat ou un chapitre donné. En divisant, le document entier est découpé en plusieurs morceaux. Pour « j’ai seulement besoin des pages 4 et 12 », l’extraction est le chemin le plus court."],
  ],
  compress: [
    ["Comment fonctionne la compression ?", "La plupart des PDF lourds le sont parce qu’ils contiennent des images ou des scans en haute résolution. La compression ramène ces images à une résolution raisonnable, regroupe les contenus intégrés en double et reconstruit le fichier. Le texte reste du texte – il n’est pas transformé en image et reste net et cherchable."],
    ["Quel niveau choisir ?", "« Recommandée » réduit les images à environ 150 dpi, suffisant pour l’écran et une impression normale. « Forte » descend à environ 72 dpi, utile quand un portail accepte par exemple 2 Mo maximum. « Faible » conserve la qualité d’impression (300 dpi) et sert surtout pour des fichiers enregistrés inutilement lourds.", "Si un PDF ne contient presque que du texte, il est généralement déjà léger. Dans ce cas, vous récupérez votre original plutôt qu’un fichier à peine plus petit, voire plus lourd."],
  ],
  "merge-compress": [
    ["Idéal pour les candidatures", "Beaucoup d’entreprises et de portails veulent un seul PDF avec lettre de motivation, CV et diplômes – et limitent souvent la taille à 5 ou 10 Mo. Des diplômes scannés font vite exploser cette limite. Avec cet outil, vous réglez les deux en une seule étape."],
  ],
  ocr: [
    ["Qu’est-ce que l’OCR ?", "OCR signifie « Optical Character Recognition », reconnaissance optique de caractères. Pour un ordinateur, un scan ou une photo prise au téléphone n’est qu’une image : impossible d’y chercher ou d’en copier le texte. L’OCR reconnaît les lettres de l’image et place le texte reconnu de façon invisible sur la page. L’original reste inchangé, mais recherche, sélection et copie fonctionnent."],
    ["À quoi sert un PDF cherchable ?", "Au bureau sans papier et à l’archivage numérique, pour retrouver vite un passage dans d’anciens contrats, relevés et courriers, pour reprendre le texte d’un scan dans Word – et parce que beaucoup d’administrations, d’experts-comptables et de portails de candidature préfèrent les PDF cherchables. Les lecteurs d’écran ne peuvent lire que les PDF avec couche de texte : l’OCR rend donc vos documents plus accessibles."],
    ["Conseils pour une bonne reconnaissance", "Scannez à 300 dpi minimum, bien droit et sans ombre. Pour les photos au téléphone, une bonne lumière du jour aide. L’écriture manuscrite n’est reconnue qu’en partie ; le texte imprimé en français, allemand et anglais l’est de façon très fiable. Les pages qui contiennent déjà du texte ne sont pas modifiées."],
  ],
  "page-numbers": [
    ["Numéros de page pour mémoires et rapports", "Beaucoup d’universités demandent que la page de titre et le sommaire ne portent pas de numéro visible. « Premières pages sans numéro » permet de les ignorer. Avec « Premier numéro », vous fixez où commence le comptage – l’introduction peut ainsi commencer à la page 1 alors qu’elle est la troisième page du fichier."],
  ],
  watermark: [
    ["Protéger copies de pièce d’identité et documents", "Si vous devez envoyer des copies de pièce d’identité, de diplômes ou de contrats, un filigrane indiquant l’usage et le destinataire aide beaucoup, par exemple « Copie pour dossier de location chez Exemple SAS ». Si la copie tombe entre de mauvaises mains, elle est bien plus difficile à détourner.", "L’option « Sur toute la page » répète le texte plusieurs fois pour qu’il ne puisse pas simplement être rogné."],
  ],
  "docx-to-pdf": [
    ["DOCX en PDF – sans Word, sur tous les appareils", "Pas besoin de Microsoft Word pour convertir un fichier DOCX en PDF. PDF Libre s’en charge dans votre navigateur – sur Windows, Mac, Linux, Chromebook, Android et iPhone. Pratique quand vous recevez un DOCX par e-mail et devez le transmettre en PDF, l’imprimer ou le déposer sur un portail de candidature.", "Marges, en-têtes et pieds de page, tableaux, images et sauts de page du DOCX sont repris dans le PDF. Titres et liens sont conservés, le texte reste cherchable et copiable."],
    ["Pourquoi envoyer un PDF plutôt qu’un Word ?", "Un document Word s’affiche un peu différemment sur chaque ordinateur – selon la version de Word et les polices installées, retours à la ligne, tableaux ou images se décalent. Un PDF s’affiche partout de la même façon, et le destinataire ne peut pas modifier le contenu par erreur."],
    ["Conseils pour un résultat parfait", "Utilisez des polices courantes comme Arial, Calibri ou Times New Roman. Les polices rares non incorporées dans le fichier sont remplacées par une police proche lors de la conversion. Jetez donc un œil au PDF avant de l’envoyer."],
  ],
  "jpg-to-pdf": [
    ["Transformer des photos en vrai document", "Tickets de caisse pour la déclaration d’impôts, fiches d’exercices ou formulaires signés sont souvent simplement photographiés au téléphone. En images séparées, ils sont peu pratiques. Dans un PDF, toutes les pages sont réunies dans le bon ordre et s’envoient ou s’impriment comme un document.", "Avec « Automatique », chaque page prend l’orientation de la photo – une photo en paysage obtient une page en paysage."],
  ],
  "heic-to-pdf": [
    ["Qu’est-ce que le HEIC ?", "Le HEIC (High Efficiency Image Container) est le format photo par défaut de l’iPhone et de l’iPad. Il économise beaucoup d’espace, mais de nombreux sites, portails administratifs et logiciels Windows ne le prennent pas en charge. Si vous avez photographié un document, une pièce d’identité, un reçu ou un diplôme avec votre iPhone, le PDF est généralement la solution la plus simple."],
    ["Photos d’iPhone en PDF pour candidature, université et administration", "Arrêt maladie pour l’employeur, justificatif pour l’université, reçus pour les impôts ou pièces pour la mairie : cet outil convertit plusieurs photos en un seul PDF en une étape. Les photos en paysage obtiennent une page en paysage, tout le reste est placé en A4 portrait."],
  ],
  "excel-to-pdf": [
    ["Rendre votre tableau lisible", "La conversion utilise les paramètres d’impression de votre fichier Excel. Sinon, les tableaux larges sont répartis sur plusieurs pages. Choisissez donc au préalable l’orientation paysage dans Excel sous « Mise en page », ou « Ajuster la feuille à une page » – le PDF ressemblera exactement à ce que vous attendez.", "Si une zone d’impression est définie, seule cette zone est convertie."],
  ],
  "ppt-to-pdf": [
    ["Partager une présentation en toute sécurité", "En PDF, une présentation s’ouvre sur tous les appareils, est bien plus légère que le fichier d’origine et ne peut pas être modifiée par erreur. Pratique pour distribuer un support après un exposé, pour un rendu à l’université ou si le destinataire n’a pas PowerPoint.", "Les animations et transitions ne sont pas jouées dans un PDF – chaque diapositive apparaît dans son état final. Les vidéos intégrées sont reprises sous forme d’image fixe."],
  ],
  pdfa: [
    ["Qu’est-ce que le PDF/A ?", "Le PDF/A est une forme normalisée du PDF (ISO 19005) destinée à l’archivage à long terme. Un fichier PDF/A contient tout ce dont il a besoin pour s’afficher – polices, profil de couleur, images – et renonce à ce qui pourrait poser problème plus tard, comme les contenus externes ou le chiffrement. Le document aura ainsi exactement le même aspect dans 20 ans."],
    ["Où le PDF/A est-il exigé ?", "Devant les tribunaux et dans les échanges juridiques électroniques, auprès de nombreuses administrations, pour les appels d’offres, demandes de subventions et mémoires universitaires, ainsi que pour l’archivage à valeur probante des documents d’entreprise. Les factures électroniques ZUGFeRD et Factur-X reposent aussi sur le PDF/A-3."],
    ["PDF/A-1b, 2b ou 3b ?", "Le PDF/A-2b est aujourd’hui la norme et prend en charge la transparence et la compression moderne. Le PDF/A-1b est la version la plus ancienne et la plus stricte – à ne choisir que s’il est expressément demandé. Le PDF/A-3b autorise en plus les fichiers intégrés. Le « b » signifie « basic » : l’aspect visuel du document est préservé durablement."],
  ],
  "pdf-to-docx": [
    ["Qu’est-ce qui est repris ?", "La conversion reconnaît paragraphes, titres, tableaux et images et construit un document Word avec du vrai texte continu. Tailles de police, gras et couleurs sont conservés. Les mises en page complexes avec beaucoup de colonnes ou de zones de texte peuvent demander quelques retouches."],
    ["Important pour les PDF scannés", "Pour un ordinateur, une page scannée n’est qu’une photo. Sans reconnaissance de texte (OCR), elle arrive comme image dans le document Word et le texte n’est pas modifiable. Pour savoir si votre PDF contient du vrai texte, essayez d’y sélectionner et copier du texte."],
  ],
  "pdf-to-excel": [
    ["À quoi sert la conversion PDF en Excel ?", "Relevés bancaires pour votre budget, listes de prix de fournisseurs, tableaux d’études ou de rapports : tout retaper prend du temps et provoque des erreurs. L’outil reconnaît lignes et colonnes et transforme les formats comme « 1 234,56 » ou « 1.234,56 » en vrais nombres."],
    ["Limites", "Cela fonctionne le mieux avec des PDF générés par un logiciel (banque en ligne, Word, Excel…). Les pages scannées sont des images sans texte et ne peuvent pas être converties. Pour des tableaux très complexes avec cellules fusionnées, un rapide coup d’œil au résultat s’impose."],
  ],
  "pdf-to-jpg": [
    ["JPG ou PNG ?", "Le JPG convient aux photos et contenus mixtes et produit des fichiers légers. Le PNG est sans perte et le meilleur choix pour les graphiques, schémas et pages riches en texte, car les contours restent nets. Pour Instagram ou LinkedIn, un JPG en résolution normale suffit."],
  ],
  summarize: [
    ["Comprendre courriers administratifs et contrats", "Avis, relances, baux ou conditions d’assurance sont souvent longs et compliqués – surtout s’ils ne sont pas rédigés dans votre langue maternelle. Le résumé explique en mots simples de quoi il s’agit et liste sous « Que dois-je faire ? » les délais, montants et démarches. Vous pouvez faire rédiger le résumé directement en français, en anglais, en turc et dans d’autres langues."],
    ["Réviser avec des cours et des études", "Pour les études et l’école, « Détaillée » résume un polycopié section par section – idéal pour réviser avant un examen. Les documents très longs sont lus par parties, puis réunis en un résumé global."],
  ],
  translate: [
    ["Traduire sans casser la mise en page", "Copier un PDF dans un logiciel de traduction fait perdre tableaux, images et mise en forme. Ici, la page reste telle quelle : seul le texte est remplacé. Idéal pour des courriers, formulaires, modes d’emploi, diplômes à comprendre et documents pour la famille ou des collègues.", "À noter : pour les documents officiels, les administrations exigent généralement une traduction assermentée. La traduction par IA aide à comprendre, mais ne la remplace pas."],
  ],
  protect: [
    ["Choisir un bon mot de passe", "Plus il est long, mieux c’est : une phrase de plusieurs mots comme « Port-Bleu-Café-42 » est plus difficile à casser qu’un mot de passe court plein de caractères spéciaux – et reste facile à retenir. N’utilisez pas un mot de passe déjà utilisé pour votre e-mail ou votre banque en ligne.", "Important : nous ne conservons pas votre mot de passe. Si vous l’oubliez, personne ne pourra rouvrir le fichier – gardez donc l’original non protégé."],
    ["Quel est le niveau de protection ?", "Le fichier est chiffré avec le standard 128 bits que tous les logiciels PDF courants savent ouvrir – Adobe Reader, navigateurs, Aperçu sur Mac et smartphones. C’est suffisant pour envoyer des factures, des fiches de paie ou des documents de candidature."],
  ],
  redact: [
    ["Un vrai caviardage, pas un simple coup de feutre", "Un rectangle noir simplement posé sur du texte dans un logiciel PDF n’est pas un vrai caviardage : le texte dessous reste présent et peut être copié ou extrait. PDF Libre supprime réellement le texte des zones caviardées et noircit aussi les parties d’images concernées. L’information ne peut plus être récupérée ensuite."],
    ["Quand faut-il caviarder un PDF ?", "Avant de transmettre des documents contenant des données d’autres personnes ou plus que nécessaire : relevés bancaires pour un dossier de location, fiches de paie, contrats, courriers médicaux, pièces judiciaires ou documents à publier. Caviarder permet de ne montrer que l’essentiel – conformément au principe de minimisation des données du RGPD."],
    ["Caviarder des documents scannés", "La recherche ne fonctionne que si le PDF contient du vrai texte. Pour un scan, convertissez d’abord le fichier avec « Rendre un PDF cherchable (OCR) », puis caviardez-le."],
  ],
  unlock: [
    ["À quoi ça sert ?", "Relevés bancaires, fiches de paie ou avis d’imposition arrivent souvent protégés par mot de passe. Pour les archiver, les fusionner ou les transmettre à votre comptable, ce mot de passe est gênant. Cet outil enregistre une copie sans protection.", "L’outil ne casse pas les mots de passe. Vous devez le connaître – ne déverrouillez que des fichiers qui vous appartiennent ou pour lesquels vous êtes autorisé."],
  ],
  "xrechnung-anzeigen": [
    ["Pourquoi ne puis-je pas simplement ouvrir une XRechnung ?", "Une XRechnung (le standard allemand de facture électronique) n’est pas une image mais un ensemble de données structurées au format XML. Les logiciels de comptabilité la lisent automatiquement ; dans un navigateur ou un éditeur de texte, on ne voit que du code. Depuis 2025, toutes les entreprises en Allemagne doivent pouvoir recevoir ces factures électroniques – mais beaucoup de petites structures n’ont pas encore le logiciel adapté.", "Cet outil lit les données et les présente comme une facture normale : émetteur, destinataire, lignes, TVA, montant à payer et coordonnées bancaires."],
    ["Et ZUGFeRD ou Factur-X ?", "Les factures ZUGFeRD et Factur-X sont des PDF qui contiennent en plus un fichier XML. Dans de rares cas, le PDF visible et les données peuvent différer. L’outil lit les données intégrées – exactement ce que traite la comptabilité."],
  ],
  "e-rechnung-pruefen": [
    ["Qu’est-ce qui est vérifié ?", "L’outil recalcule la facture : les lignes correspondent-elles au total, la TVA au taux appliqué, le HT plus la taxe donne-t-il le TTC, et le montant à payer est-il juste ? Il contrôle aussi les mentions obligatoires comme le numéro de facture, la date et le numéro fiscal de l’émetteur, et vérifie l’IBAN contre les fautes de frappe.", "Le contrôle complet selon les règles officielles XRechnung est effectué avec le validateur du KoSIT lorsqu’il est disponible sur le serveur. Le rapport indique si ce contrôle a eu lieu."],
    ["À partir de quand dois-je envoyer des factures électroniques en Allemagne ?", "Toutes les entreprises en Allemagne doivent pouvoir recevoir des factures électroniques depuis le 1er janvier 2025. Pour l’envoi : les entreprises réalisant plus de 800 000 € de chiffre d’affaires l’année précédente à partir du 1er janvier 2027, toutes les autres à partir du 1er janvier 2028. Sont notamment exclues les petites factures jusqu’à 250 € et les factures aux particuliers. En cas de doute, demandez à votre expert-comptable."],
  ],
};
