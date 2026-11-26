// Versions françaises des guides de candidature (mêmes slugs qu'en allemand, pour que les liens hreflang correspondent)
module.exports = {
  "factur-x-oeffnen": {
    "guide": "Ouvrir une facture Factur-X",
    "name": "Ouvrir un Factur-X",
    "title": "Ouvrir une facture Factur-X – lire et vérifier en ligne, gratuit | PDF Libre",
    "description": "Ouvrir une facture Factur-X : lire les données intégrées, vérifier totaux et TVA, enregistrer en PDF. Gratuit, sans logiciel, sans inscription.",
    "h1": "Ouvrir et vérifier une facture Factur-X",
    "lead": "Vous recevez des factures Factur-X depuis la réforme ? Déposez-les ici : vous voyez exactement les données que lit le logiciel comptable – et si les montants sont justes.",
    "steps": [
      [
        "Choisir le PDF Factur-X",
        "La facture reçue de votre fournisseur."
      ],
      [
        "Lire les données",
        "Émetteur, destinataire, lignes, TVA et net à payer s’affichent clairement, recalculés."
      ],
      [
        "Enregistrer",
        "« Enregistrer en PDF » garde la version lisible. Conservez aussi l’original."
      ]
    ],
    "article": [
      [
        "Réforme : la réception est obligatoire depuis septembre 2026",
        "Depuis le 1er septembre 2026, toutes les entreprises – y compris les micro-entrepreneurs et auto-entrepreneurs – doivent pouvoir recevoir des factures électroniques. Les grandes entreprises et ETI les émettent déjà ; les PME, TPE et micro-entreprises devront les émettre à partir du 1er septembre 2027. Factur-X est l’un des trois formats acceptés, avec UBL et CII.",
        "Factur-X est un PDF qui contient en plus un fichier XML. Il est identique au format allemand ZUGFeRD 2.x."
      ],
      [
        "Pourquoi vérifier les données intégrées",
        "Le PDF visible et le XML intégré devraient être identiques – ce n’est pas toujours le cas. Cet outil affiche les données intégrées et recalcule les totaux et la TVA pour repérer une erreur avant de payer."
      ]
    ],
    "faq": [
      [
        "Ma facture est-elle enregistrée ?",
        "Non. Elle est seulement lue puis supprimée."
      ],
      [
        "Le PDF enregistré est-il une facture valable ?",
        "Non, c’est un affichage lisible. Conservez le fichier Factur-X original."
      ],
      [
        "Et si je reçois un fichier XML (UBL ou CII) ?",
        "Déposez-le aussi : les formats UBL et CII sont pris en charge."
      ]
    ]
  },
  "peppol-rechnung-oeffnen": {
    "guide": "Ouvrir une facture Peppol (UBL) – Belgique",
    "name": "Ouvrir une facture Peppol",
    "title": "Ouvrir une facture Peppol – lire un fichier UBL XML en ligne, gratuit | PDF Libre",
    "description": "Ouvrir une facture Peppol (UBL XML, Peppol BIS Billing 3.0) en ligne : affichage clair en français, contrôle des totaux et de la TVA, enregistrement en PDF. Pour la Belgique. Gratuit.",
    "h1": "Ouvrir une facture Peppol (UBL)",
    "lead": "Vous avez reçu une facture en XML via Peppol et ne savez pas l’ouvrir ? Déposez-la : elle s’affiche comme une facture normale, avec un contrôle automatique.",
    "steps": [
      [
        "Choisir le fichier XML",
        "La facture Peppol au format UBL (.xml)."
      ],
      [
        "Lire la facture",
        "Toutes les informations s’affichent clairement, totaux et TVA recalculés."
      ],
      [
        "Enregistrer en PDF",
        "Pour votre classement ou pour l’envoyer à votre comptable."
      ]
    ],
    "article": [
      [
        "Peppol obligatoire en Belgique depuis 2026",
        "Depuis le 1er janvier 2026, la facturation électronique via Peppol est obligatoire entre entreprises en Belgique – pour toutes les entreprises assujetties à la TVA, y compris les indépendants à titre complémentaire. Les factures Peppol sont des fichiers XML au format UBL selon la norme EN 16931 (Peppol BIS Billing 3.0)."
      ],
      [
        "Lire un XML sans logiciel",
        "Ouvert dans le navigateur, un fichier UBL n’affiche que du code. Cet outil le transforme en facture lisible et indique si les lignes, la TVA et le net à payer concordent."
      ]
    ],
    "faq": [
      [
        "Ai-je besoin d’un accès Peppol ?",
        "Pas pour lire une facture. Pour envoyer et recevoir via le réseau Peppol, il faut un prestataire (point d’accès)."
      ],
      [
        "Le PDF est-il une facture valable ?",
        "Non, c’est un affichage lisible. Le fichier XML fait foi."
      ]
    ]
  },
  "cerfa-ausfuellen": {
    "guide": "Remplir un CERFA en ligne",
    "name": "Remplir un CERFA",
    "title": "Remplir un CERFA en ligne – formulaire PDF dans le navigateur, gratuit | PDF Libre",
    "description": "Remplir un formulaire CERFA en ligne sans Adobe : champs remplissables dans le navigateur, et la version statique « non remplissable » devient remplissable automatiquement. Gratuit, sans envoi du fichier.",
    "h1": "Remplir un formulaire CERFA en ligne",
    "lead": "Le CERFA affiche « To view the full contents of this document, you need a later version of the PDF viewer » ? La version statique n’est pas remplissable ? Ici, vous pouvez quand même le remplir à l’écran.",
    "steps": [
      [
        "Ouvrir le CERFA",
        "Déposez le formulaire PDF. S’il n’affiche qu’un message Adobe, téléchargez la « version statique » sur service-public.fr et déposez-la."
      ],
      [
        "Remplir les champs",
        "Les champs existants s’affichent ; dans la version statique, lignes et cases deviennent automatiquement des champs."
      ],
      [
        "Enregistrer",
        "Téléchargez le PDF rempli, imprimez-le ou envoyez-le par e-mail."
      ]
    ],
    "article": [
      [
        "Pourquoi le CERFA ne s’ouvre pas dans le navigateur",
        "Beaucoup de CERFA sont des formulaires « dynamiques » au format XFA. Les lecteurs PDF de Chrome, Edge et Safari, et l’app Adobe Reader sur iPhone et iPad, ne savent pas les afficher : on voit seulement un message demandant une version plus récente d’Adobe Reader. La version statique s’ouvre, mais n’a aucun champ."
      ],
      [
        "La solution",
        "Ouvrez ici la version statique : PDF Libre détecte les lignes et les cases et les transforme en champs de saisie. Tout se passe dans votre navigateur, vos informations ne sont pas envoyées."
      ]
    ],
    "faq": [
      [
        "L’administration accepte-t-elle le formulaire rempli ?",
        "Oui, tant que vous remplissez seulement les champs sans modifier le formulaire. Signez-le ensuite comme d’habitude."
      ],
      [
        "Mon formulaire est-il envoyé sur un serveur ?",
        "Non. Le remplissage et l’enregistrement se font dans votre navigateur."
      ],
      [
        "Le CERFA reste vide ou n’affiche qu’un message ?",
        "C’est la version dynamique (XFA). Téléchargez la version statique proposée sur la même page de service-public.fr."
      ]
    ]
  },
  "pdf-in-e-rechnung-umwandeln": {
    "guide": "Transformer une facture PDF en facture électronique",
    "name": "PDF en facture électronique",
    "title": "Transformer un PDF en facture électronique – ZUGFeRD & XRechnung, gratuit | PDF Libre",
    "description": "Transformer une facture PDF en facture électronique allemande : déposer un PDF, un scan ou une photo, vérifier et confirmer les données, télécharger le PDF ZUGFeRD ou la XRechnung. Avec contrôle des totaux. Gratuit, sans inscription.",
    "h1": "Transformer une facture PDF en facture électronique",
    "lead": "Votre facture actuelle – en PDF, scan ou photo – devient une facture électronique valable selon EN 16931. Vous voyez d’abord toutes les données détectées et les confirmez.",
    "steps": [
      [
        "Déposer la facture",
        "Cliquez sur « Déposer une facture » en haut et choisissez le PDF, le scan ou la photo."
      ],
      [
        "Confirmer les données",
        "Expéditeur, destinataire, lignes, TVA et total s’affichent en aperçu. Les éléments incertains sont surlignés en orange – corrigez-les si besoin."
      ],
      [
        "Télécharger la facture électronique",
        "Après « Tout est correct », vous obtenez le PDF ZUGFeRD ou la XRechnung (XML) et le voyez avant de le télécharger."
      ]
    ],
    "article": [
      [
        "Pourquoi un PDF normal n’est pas une facture électronique",
        "Un PDF issu de Word ou Excel ne contient les données que sous forme de texte sur une page. Une facture électronique les contient en plus sous forme de XML structuré selon EN 16931 – le logiciel comptable du destinataire reprend ainsi automatiquement montant, TVA, IBAN et numéro. À partir de 2027 (plus de 800 000 € de chiffre d’affaires l’année précédente) ou 2028, les entreprises en Allemagne doivent émettre leurs factures B2B nationales sous forme électronique."
      ],
      [
        "Comment fonctionne la conversion",
        "Le texte de votre facture est lu – par OCR pour les scans et photos. Une IA attribue les informations : qui émet la facture, qui la reçoit, quelles lignes, quels taux de TVA. Ensuite nous vérifions nous-mêmes : les lignes donnent-elles le total indiqué ? Le numéro de facture figure-t-il vraiment dans le document ? L’IBAN est-il valide ?",
        "Tout ce qui n’est pas clair est surligné. La facture électronique n’est créée qu’après votre confirmation – vous restez responsable du contenu, mais vous n’avez rien à retaper."
      ],
      [
        "Conseils pour un bon résultat",
        "Les PDF générés directement par un logiciel fonctionnent le mieux. Pour une photo : facture à plat, bonne lumière, page entière visible. Sur la page de confirmation, vérifiez surtout les taux de TVA et les prix unitaires – en particulier si votre facture affiche des prix TTC."
      ]
    ],
    "faq": [
      [
        "Puis-je convertir la photo d’une facture ?",
        "Oui. Les JPG, PNG ou HEIC du téléphone sont lus par OCR. Vérifiez alors les chiffres avec une attention particulière."
      ],
      [
        "Ma facture est-elle enregistrée ?",
        "Non. Le texte est envoyé à notre serveur et au service d’IA uniquement pour la lecture, puis il n’est pas conservé."
      ],
      [
        "Et si quelque chose est mal détecté ?",
        "Cliquez sur « Corriger » et modifiez les champs. L’aperçu montre immédiatement le résultat."
      ],
      [
        "ZUGFeRD ou XRechnung ?",
        "ZUGFeRD (PDF avec données intégrées) pour les clients professionnels, XRechnung pour les administrations."
      ]
    ]
  },
  "pdf-ausfuellbar-machen": {
    guide: "Rendre un PDF remplissable (même scanné)",
    name: "Rendre un PDF remplissable",
    title: "Rendre un PDF remplissable – détection automatique des champs, gratuit | PDF Libre",
    description: "Rendre un PDF remplissable : les lignes, cases et tableaux d’un formulaire scanné ou « plat » deviennent automatiquement des champs. En ligne, gratuit, sans Adobe Acrobat et sans envoi du fichier.",
    h1: "Rendre un PDF remplissable",
    lead: "Transformez un formulaire imprimé, scanné ou « plat » en vrai PDF remplissable : lignes d’écriture, cadres et cellules de tableau deviennent automatiquement des champs.",
    steps: [
      ["Ouvrir le PDF", "Choisissez le formulaire – scanné, issu d’une photo ou exporté depuis Word."],
      ["Vérifier les champs", "Les champs détectés sont surlignés en bleu. Supprimez ceux en trop avec ×, ajoutez ceux qui manquent avec « + Champ texte » ou « + Case à cocher »."],
      ["Enregistrer", "« Enregistrer comme PDF remplissable vierge » crée un formulaire que chacun peut remplir dans Adobe Reader, un navigateur ou sur téléphone. Ou remplissez-le directement ici."],
    ],
    article: [
      ["Comment un scan devient-il un formulaire remplissable ?", "Pour un ordinateur, un formulaire scanné n’est qu’une image : il n’y a aucun champ où cliquer. PDF Libre analyse l’image de chaque page et cherche les éléments typiques d’un formulaire – lignes d’écriture (« Nom : ______ »), cadres, cellules de tableau, petites cases à cocher et lignes pointillées. De vrais champs de formulaire PDF sont créés exactement à ces endroits.", "Les pages scannées légèrement de travers sont d’abord redressées automatiquement. Pour les PDF contenant du vrai texte (exportés depuis Word par exemple), les champs reçoivent aussi des noms parlants comme « Nom », « Date de naissance » ou « IBAN » – pratique si les données sont traitées ensuite."],
      ["Pour qui est-ce utile ?", "Associations, écoles, cabinets médicaux, syndics et petites entreprises ont souvent des formulaires qui n’existent qu’en papier ou en scan : inscriptions, demandes d’adhésion, autorisations, feuilles d’heures. Avec PDF Libre, vous en faites en une minute un formulaire à envoyer par e-mail ou à mettre sur votre site – et les destinataires le remplissent sur ordinateur au lieu de l’imprimer.", "Jusqu’ici, il fallait Adobe Acrobat Pro ou un logiciel similaire. Ici, tout fonctionne gratuitement dans le navigateur."],
      ["Conseils pour un bon résultat", "La détection fonctionne le mieux avec des scans droits aux lignes nettes et continues. Les formulaires photographiés avec des ombres ou du papier courbé sont plus difficiles – scannez-les si possible avec une application de scan. Les lignes pointillées sont détectées dans les PDF contenant du vrai texte ; dans les scans purs, ajoutez rapidement ces champs avec « + Champ texte »."],
    ],
    faq: [
      ["Comment rendre un PDF remplissable ?", "Choisissez le PDF – les champs sont détectés automatiquement. Vérifiez, complétez si besoin, puis cliquez sur « Enregistrer comme PDF remplissable vierge »."],
      ["Est-ce que ça marche avec des formulaires scannés ?", "Oui. Les lignes et les cases sont aussi détectées dans les scans, et les pages légèrement de travers sont redressées automatiquement."],
      ["Ai-je besoin d’Adobe Acrobat ?", "Non. Le PDF remplissable est créé directement dans le navigateur et fonctionne dans Adobe Reader, Chrome, Firefox, Edge, Safari et sur téléphone."],
      ["Mon PDF est-il envoyé sur un serveur ?", "Non. La détection et l’enregistrement se font entièrement dans votre navigateur."],
      ["Puis-je ajouter des champs moi-même ?", "Oui. Cliquez sur « + Champ texte » ou « + Case à cocher », puis à l’endroit voulu. Supprimez un champ erroné avec le × sur le champ."],
    ],
  },
  "bewerbung-pdf-zusammenfuegen": {
    guide: "Réunir ses documents de candidature en un seul PDF",
    name: "Candidature en un seul PDF",
    title: "Réunir sa candidature en un seul PDF – lettre, CV et diplômes | PDF Libre",
    description: "Fusionnez vos documents de candidature en un PDF en ligne : lettre de motivation, CV et diplômes dans le bon ordre, avec page de garde et sous 5 Mo – comme l’attendent les recruteurs. Gratuit, sans inscription.",
    h1: "Réunir ses documents de candidature en un seul PDF",
    lead: "Lettre de motivation, CV, certificats de travail et diplômes dans un seul PDF – trié, avec sommaire et assez léger pour tous les portails de candidature et tous les e-mails.",
    steps: [
      ["Importer tous les documents", "Choisissez lettre de motivation, CV, certificats et diplômes – en PDF, en Word ou en photo prise au téléphone."],
      ["Définir l’ordre", "Glissez les fichiers dans le bon ordre : lettre, CV, certificats de travail, diplômes, attestations."],
      ["Télécharger le PDF de candidature", "Cliquez sur « Créer le dossier PDF ». Vous obtenez un fichier PDF à déposer directement ou à envoyer par e-mail."],
    ],
    article: [
      ["Pourquoi les recruteurs préfèrent un seul PDF", "Pour une candidature en ligne, mieux vaut envoyer un seul PDF que dix pièces jointes. Les RH peuvent l’ouvrir, le transférer et l’imprimer d’un clic – et rien ne se perd. Beaucoup d’entreprises l’écrivent explicitement dans l’annonce : « Merci d’envoyer vos documents en un seul fichier PDF. »", "Avec PDF Libre, vous réunissez gratuitement vos documents, sans logiciel et sans compte. Les fichiers Word comme votre lettre ou votre CV sont convertis en PDF automatiquement, les photos de diplômes sont placées sur des pages A4."],
      ["Le bon ordre des documents de candidature", "Un ordre qui a fait ses preuves : page de garde (facultative), lettre de motivation, CV, certificats de travail ou attestations d’emploi (le plus récent d’abord), diplôme universitaire ou professionnel, bulletin scolaire, puis attestations, formations et exemples de travaux. Pour un apprentissage ou un stage, les derniers bulletins et attestations de stage viennent juste après le CV."],
      ["Pour un job étudiant, un apprentissage ou une candidature spontanée", "Apprentissage, stage, job étudiant, temps partiel ou candidature spontanée : le principe est toujours le même. Tous les documents vont dans un seul fichier clair avec un nom parlant, par exemple « Candidature_Marie_Dupont.pdf »."],
    ],
    faq: [
      ["Puis-je mélanger fichiers Word et PDF ?", "Oui. Vous pouvez importer ensemble PDF, Word (DOC, DOCX), ODT et photos (JPG, PNG). Tout est converti en PDF automatiquement et fusionné."],
      ["Comment nommer mon PDF de candidature ?", "Avec le contenu et votre nom, par exemple « Candidature_Marie_Dupont.pdf » ou « Candidature_Stage_Marie_Dupont.pdf ». Évitez accents et espaces pour que tous les portails acceptent le fichier."],
      ["La candidature doit-elle tenir en un seul fichier ?", "Pas toujours, mais c’est généralement mieux. Si un portail propose des champs séparés pour la lettre et le CV, déposez-les séparément – sinon, envoyez un seul PDF."],
      ["La fusion est-elle gratuite ?", "Oui, entièrement gratuite, sans inscription et sans filigrane. Vos fichiers sont supprimés juste après la création."],
    ],
  },
  "bewerbung-pdf-verkleinern": {
    guide: "Alléger son PDF de candidature (moins de 2 ou 5 Mo)",
    name: "Alléger un PDF de candidature",
    title: "Alléger son PDF de candidature – moins de 2 Mo ou 5 Mo, gratuit | PDF Libre",
    description: "PDF de candidature trop lourd ? Réduisez-le en ligne à moins de 2 Mo ou 5 Mo pour les portails de candidature et l’e-mail – le texte reste net. Gratuit, sans inscription.",
    h1: "Alléger son PDF de candidature – moins de 2 Mo ou 5 Mo",
    lead: "Le portail affiche « fichier trop volumineux » ? Importez votre candidature et choisissez la taille cible. Images et scans sont réduits, le texte reste parfaitement net.",
    steps: [
      ["Importer la candidature", "Importez votre PDF de candidature terminé – ou directement tous les documents séparés."],
      ["Choisir la taille cible", "Choisissez « Moins de 2 Mo » ou « Moins de 5 Mo », selon ce que demande le portail ou l’annonce."],
      ["Télécharger le PDF allégé", "Le fichier est réduit progressivement jusqu’à passer sous la limite et il est prêt à être déposé."],
    ],
    article: [
      ["Quelle taille pour un PDF de candidature ?", "La plupart des portails acceptent 2 à 5 Mo par fichier, certains seulement 1 Mo. Pour une candidature par e-mail, 3 à 5 Mo est une taille raisonnable – les pièces jointes plus lourdes finissent plus souvent en spam ou sont refusées par le serveur. Une candidature complète avec lettre, CV et diplômes tient normalement sans problème en 1 à 3 Mo."],
      ["Pourquoi ma candidature est-elle si lourde ?", "Presque toujours à cause de diplômes scannés ou de photos prises au téléphone en très haute résolution, et de grandes photos d’identité. Une seule photo de smartphone peut peser 5 Mo. PDF Libre réduit précisément ces images jusqu’à ce que le fichier passe sous votre limite – polices et traits restent nets et cherchables."],
      ["Alléger sans dégrader l’aspect", "Les images ne sont réduites que du strict nécessaire. Pour des diplômes, 150 dpi suffisent largement – aucune différence visible à l’écran ni à l’impression. Vérifiez tout de même à la fin que tampons et signatures restent lisibles."],
    ],
    faq: [
      ["Comment passer ma candidature sous 2 Mo ?", "Importez la candidature, choisissez « Moins de 2 Mo » et cliquez sur « Créer le dossier PDF ». Les images du PDF sont réduites automatiquement jusqu’à ce que le fichier fasse moins de 2 Mo."],
      ["La qualité en pâtit-elle ?", "Texte, traits et polices restent parfaitement nets. Seules les photos et les scans sont réduits en résolution – juste assez pour que cela ne se voie pas à la lecture."],
      ["Puis-je aussi alléger un PDF normal ?", "Oui. Pour tout autre PDF, utilisez plutôt « Compresser PDF »."],
      ["Que faire si le portail n’accepte que 1 Mo ?", "Choisissez « Moins de 2 Mo » et vérifiez la taille. Si cela ne suffit pas, importez vos diplômes en scan noir et blanc plutôt qu’en photo couleur – c’est ce qui fait gagner le plus de place."],
    ],
  },
  "bewerbung-deckblatt": {
    guide: "Créer une page de garde pour sa candidature",
    name: "Page de garde de candidature",
    title: "Créer une page de garde de candidature – gratuit en PDF | PDF Libre",
    description: "Créez en ligne une page de garde pour votre candidature : nom, poste, entreprise, coordonnées et sommaire automatique – directement dans votre dossier PDF. Gratuit.",
    h1: "Créer une page de garde pour sa candidature",
    lead: "Indiquez votre nom, le poste et l’entreprise – PDF Libre place une page de garde sobre et professionnelle, avec sommaire, devant vos documents.",
    steps: [
      ["Importer les documents", "Importez lettre de motivation, CV et diplômes et mettez-les dans le bon ordre."],
      ["Remplir la page de garde", "Indiquez votre nom, le poste et l’entreprise, et si vous voulez e-mail, téléphone et ville."],
      ["Télécharger avec page de garde", "La page de garde est placée automatiquement au début, avec un sommaire tiré des noms de vos fichiers."],
    ],
    article: [
      ["Une candidature a-t-elle besoin d’une page de garde ?", "La page de garde n’est pas obligatoire, mais elle fait soigné et montre d’un coup d’œil qui postule à quel poste. Elle est particulièrement utile pour un dossier PDF avec beaucoup d’annexes, car le sommaire indique ce qu’il contient. Pour une candidature très courte – par exemple seulement lettre et CV – vous pouvez vous en passer."],
      ["Que mettre sur la page de garde ?", "En général : le mot « Candidature », le poste (ex. « Stage Data Science » ou « Alternance assistant(e) de gestion »), l’entreprise, votre nom complet et vos coordonnées. La photo est facultative. Le sommaire liste la lettre, le CV et toutes les annexes."],
      ["Sobre plutôt que coloré", "Une bonne page de garde est calme et lisible : beaucoup d’espace blanc, une police claire, pas de cadres colorés. C’est exactement ainsi qu’est conçue celle de PDF Libre – elle s’accorde avec tous les CV et tous les secteurs."],
    ],
    faq: [
      ["Le sommaire est-il créé automatiquement ?", "Oui, à partir des noms de vos fichiers. « Certificat_Exemple_SAS.pdf » devient « Certificat Exemple SAS ». Donnez donc des noms parlants à vos fichiers avant."],
      ["Dois-je indiquer téléphone et adresse ?", "Non, ces champs sont facultatifs. Nom, poste et entreprise suffisent pour une page de garde complète."],
      ["Puis-je mettre une photo sur la page de garde ?", "Pas pour l’instant. Importez la photo comme page séparée ou placez-la dans votre CV – dans beaucoup de pays, la photo est facultative."],
      ["La page de garde est-elle payante ?", "Non. La page de garde et tout le dossier de candidature sont gratuits et sans inscription."],
    ],
  },
  "bewerbung-per-email": {
    guide: "Candidature par e-mail : bien préparer la pièce jointe PDF",
    name: "Candidature par e-mail",
    title: "Candidature par e-mail : créer la bonne pièce jointe PDF | PDF Libre",
    description: "Envoyer sa candidature par e-mail : tous les documents dans une pièce jointe PDF de moins de 5 Mo, le bon nom de fichier et le bon objet. Créez votre PDF de candidature gratuitement en ligne.",
    h1: "Candidature par e-mail : créer la bonne pièce jointe PDF",
    lead: "Pour une candidature par e-mail, il vous faut une seule pièce jointe PDF légère. Importez vos documents – PDF Libre les fusionne et les ramène sous 5 Mo.",
    steps: [
      ["Choisir les documents", "Importez lettre de motivation, CV et diplômes – PDF, Word ou photo."],
      ["Fixer la taille", "Choisissez « Moins de 5 Mo » (par défaut) ou « Moins de 2 Mo » si l’annonce indique une limite."],
      ["Envoyer en pièce jointe", "Téléchargez le PDF et joignez-le à votre e-mail."],
    ],
    article: [
      ["À quoi ressemble une bonne candidature par e-mail", "Objet : « Candidature au poste de [poste] – [référence] ». Le corps de l’e-mail tient en quelques phrases : qui vous êtes, à quel poste vous postulez et que vos documents sont en pièce jointe. La lettre de motivation elle-même va dans le PDF – pas en double dans l’e-mail. Terminez par une signature complète avec votre numéro de téléphone."],
      ["Une seule pièce jointe : nom et taille du fichier", "Envoyez une seule pièce jointe PDF avec un nom clair, par exemple « Candidature_Marie_Dupont.pdf ». Restez sous 5 Mo, idéalement sous 3 Mo – certaines boîtes mail d’entreprise refusent les pièces jointes plus lourdes sans que vous le sachiez. Ne joignez jamais directement un fichier Word : il s’affiche souvent différemment ailleurs et peut être modifié."],
      ["Liste de vérification avant l’envoi", "Bon interlocuteur dans la lettre ? Poste et entreprise corrects partout ? Toutes les pages dans le bon ordre et lisibles ? Fichier sous la limite de taille ? Adresse d’expéditeur sérieuse (prenom.nom@…) ? Alors votre candidature peut partir."],
    ],
    faq: [
      ["Quel format pour une candidature par e-mail ?", "Le PDF. Il s’affiche de la même façon sur tous les appareils et ne peut pas être modifié par erreur. Joindre des fichiers Word, des archives ZIP ou des images séparées fait peu professionnel."],
      ["Quelle taille pour la pièce jointe ?", "Règle générale : moins de 5 Mo, idéalement moins de 3 Mo. Si l’annonce indique une limite, respectez-la exactement."],
      ["La lettre de motivation va-t-elle dans l’e-mail ou dans le PDF ?", "Dans le PDF. L’e-mail n’est qu’un court message d’accompagnement qui renvoie à la pièce jointe."],
      ["Mes documents de candidature sont-ils conservés ?", "Non. Tous les fichiers sont supprimés du serveur juste après la création."],
    ],
  },
  "lebenslauf-pdf": {
    guide: "Enregistrer son CV en PDF (Word en PDF)",
    name: "Convertir son CV en PDF",
    title: "Enregistrer son CV en PDF – convertir un CV Word en PDF gratuitement | PDF Libre",
    description: "Convertissez votre CV Word (DOCX) en PDF : mise en page, polices et photo sont conservées. CV en PDF pour candidatures et portails de recrutement – gratuit, sans inscription.",
    h1: "Enregistrer son CV en PDF",
    lead: "Importez votre CV au format Word et obtenez un PDF identique sur tous les appareils – avec photo, tableaux et polices.",
    steps: [
      ["Importer le CV", "Choisissez votre CV en DOCX, DOC ou ODT."],
      ["Convertir", "Cliquez sur « Convertir en PDF ». Mise en page, photo et mise en forme sont reprises."],
      ["Vérifier et utiliser le PDF", "Téléchargez le PDF, vérifiez rapidement les sauts de page, puis ajoutez-le à votre candidature avec « Créer le dossier PDF »."],
    ],
    article: [
      ["Pourquoi envoyer son CV en PDF", "Un CV Word s’affiche différemment sur chaque ordinateur : s’il manque une police, tableaux, traits et photo se décalent. En PDF, votre CV reste exactement tel que vous l’avez conçu – que le recruteur le lise sur PC, Mac ou téléphone. Et un PDF ne peut pas être modifié par erreur."],
      ["Modèle de CV Word ou Canva ?", "Que vous ayez rédigé votre CV avec un modèle Word, dans LibreOffice ou dans Google Docs : enregistrez-le en DOCX et convertissez-le ici en PDF. Depuis Canva ou Pages, exportez plutôt directement en PDF – vous pourrez ensuite le réunir avec votre lettre et vos diplômes grâce à notre outil de dossier de candidature."],
      ["Conseils pour un bon CV en PDF", "Une à deux pages, antichronologique (expérience la plus récente en premier), des titres clairs comme « Expérience professionnelle », « Formation », « Compétences » et « Langues ». Nommez le fichier avec votre nom, par exemple « CV_Marie_Dupont.pdf » – le recruteur le retrouvera tout de suite."],
    ],
    faq: [
      ["Ma photo est-elle conservée dans le PDF ?", "Oui. Photos, tableaux, traits et colonnes sont repris dans le PDF."],
      ["Mon CV utilise une police spéciale – est-elle conservée ?", "Les polices courantes s’affichent correctement. Pour des polices très rares, une police proche peut être utilisée. Vérifiez donc le PDF avant de l’envoyer."],
      ["Comment réunir mon CV et ma lettre de motivation ?", "Utilisez « Créer le dossier PDF » : vous pouvez y importer ensemble fichiers Word et PDF et tout réunir en un seul PDF de candidature."],
      ["La conversion est-elle gratuite ?", "Oui, gratuite et sans inscription. Le fichier est supprimé juste après la conversion."],
    ],
  },
  "zeugnisse-als-pdf": {
    guide: "Diplômes et certificats en PDF depuis son téléphone",
    name: "Diplômes en PDF",
    title: "Diplômes en PDF – photos et scans du téléphone en un seul PDF | PDF Libre",
    description: "Diplômes, certificats et justificatifs en PDF : convertissez photos de téléphone ou scans (JPG, PNG) en un PDF – pour candidatures, université et administrations. Gratuit, sans inscription.",
    h1: "Diplômes en PDF – de la photo au PDF",
    lead: "Photographiez vos diplômes avec votre téléphone ou scannez-les et obtenez un PDF propre – pour votre candidature, une inscription à l’université ou l’administration.",
    steps: [
      ["Choisir les photos", "Sélectionnez les photos ou scans de vos diplômes et certificats (JPG ou PNG)."],
      ["Définir l’ordre", "Triez les pages – par exemple le diplôme le plus récent en premier."],
      ["Télécharger le PDF", "Toutes les images vont dans un PDF à déposer, à envoyer par e-mail ou à ajouter à votre dossier de candidature."],
    ],
    article: [
      ["Bien photographier ses diplômes", "Posez le document sur un fond sombre et uni, photographiez-le bien droit par-dessus, à la lumière du jour et sans flash. Veillez à ce que les quatre coins soient visibles et qu’aucune ombre ne tombe sur le texte. Notes, tampons et signature resteront ainsi bien lisibles."],
      ["Diplômes pour candidature, inscription universitaire et reconnaissance", "Certificat de travail, baccalauréat, licence, certificat de langue (TOEIC, IELTS, DELF, Goethe…) ou attestation de stage : beaucoup de portails – entreprises, universités, administrations – exigent les justificatifs en PDF. Vous pouvez regrouper plusieurs diplômes dans un fichier ou créer un PDF par document."],
      ["Ajouter les diplômes au dossier de candidature", "Le PDF de vos diplômes peut être réuni directement avec la lettre et le CV dans un dossier de candidature. Le fichier y est aussi réduit automatiquement sous 5 Mo si les photos sont très lourdes."],
    ],
    faq: [
      ["Une photo au téléphone suffit-elle à la place d’un scan ?", "Pour la plupart des candidatures en ligne, oui, si la photo est droite, nette et bien éclairée. Pour des démarches officielles, une copie certifiée conforme peut être exigée – cela dépend de l’organisme."],
      ["Combien de diplômes puis-je mettre dans un PDF ?", "Autant que vous voulez. Chaque image devient une page."],
      ["Le PDF est trop lourd – que faire ?", "Ajoutez-le au dossier de candidature en choisissant une taille cible, ou utilisez « Compresser PDF »."],
      ["Mes diplômes sont-ils conservés ?", "Non. La conversion se fait directement dans votre navigateur, vos photos ne quittent pas votre appareil."],
    ],
  },
  "lebenslauf-vorlage": {
    guide: "Modèle de CV gratuit (alternative à Word, en PDF)",
    name: "Modèle de CV",
    title: "Modèle de CV gratuit – moderne, classique et en PDF | PDF Libre",
    description: "Modèles de CV gratuits : Moderne, Classique, style LaTeX et Compact. Remplissez-les en ligne au lieu de batailler avec un modèle Word – téléchargez un PDF compatible ATS. Sans inscription.",
    h1: "Modèle de CV gratuit – à remplir et enregistrer en PDF",
    lead: "Marre de vous battre avec les tableaux et les tabulations dans Word ? Choisissez un modèle, saisissez vos informations – la mise en page s’adapte automatiquement.",
    article: [
      ["Remplir un modèle en ligne plutôt que modifier un fichier Word", "Les modèles de CV classiques pour Word ou Google Docs se décalent vite : une ligne de plus et le tableau saute à la page suivante. Ici, vous saisissez seulement le contenu – espacements, polices et sauts de page sont gérés par PDF Libre. Un titre qui se retrouverait seul en bas de page passe automatiquement à la page suivante."],
      ["Quel modèle de CV me correspond ?", "Pour l’informatique, le marketing, les start-up, les jobs étudiants et les stages : « Moderne ». Pour la banque, l’administration, l’assurance, les cabinets et l’industrie : « Classique ». Pour la recherche, le doctorat, les bourses et les filières techniques : « Académique » style LaTeX. Pour beaucoup d’expérience sur une page : « Compact ». Vous pouvez changer à tout moment sans rien ressaisir."],
    ],
    faq: [
      ["Le modèle de CV est-il payant ?", "Non. Tous les modèles sont gratuits et sans filigrane."],
      ["Puis-je obtenir le modèle au format Word ?", "Le CV est créé en PDF – le format qu’attendent recruteurs et portails de candidature. Si vous avez quand même besoin de Word, convertissez le PDF avec « PDF en Word »."],
      ["Puis-je changer de modèle ?", "Oui, à tout moment. Vos informations restent, seul le design change."],
    ],
  },
  "lebenslauf-ats": {
    guide: "CV compatible ATS : comment les logiciels de recrutement le lisent",
    name: "CV compatible ATS",
    title: "CV compatible ATS – modèle gratuit | PDF Libre",
    description: "Créez un CV compatible ATS : une colonne, du vrai texte, des titres standard et une vérification ATS avec conseils. Pour que votre candidature passe les logiciels de recrutement. Gratuit en PDF.",
    h1: "Créer un CV compatible ATS",
    lead: "Pour que votre candidature ne soit pas écartée par le logiciel : des modèles lisibles par tous les ATS – avec une vérification ATS juste à côté de l’aperçu.",
    article: [
      ["Pourquoi des CV échouent dans un ATS", "Mises en page sur plusieurs colonnes que le logiciel mélange ; coordonnées dans l’en-tête ou en image ; icônes à la place des mots (« 📞 » au lieu de « Téléphone ») ; titres créatifs comme « Mon parcours » au lieu de « Expérience professionnelle » ; graphiques pour les langues ; polices sans correspondance Unicode propre, que l’ATS lit comme du charabia. Les modèles de PDF Libre évitent tout cela."],
      ["Reprendre les mots-clés de l’offre", "Un ATS compare votre CV aux exigences du poste. Utilisez donc les termes de l’annonce quand ils vous correspondent – par exemple « Python », « SQL », « gestion de projet » ou « relation client » – dans vos compétences et dans la description de vos expériences. Écrivez une fois les abréviations en entier (« Customer Relationship Management (CRM) »). Mais n’inventez rien : chaque information est vérifiée en entretien."],
      ["La vérification ATS de PDF Libre", "À côté de l’aperçu, PDF Libre vérifie que votre nom et vos coordonnées sont bien en texte, qu’il y a un court profil, que toutes les dates ont le même format, que vos expériences sont décrites et que le CV fait deux pages maximum."],
    ],
    faq: [
      ["Qu’est-ce qu’un ATS ?", "Un ATS (Applicant Tracking System) est un logiciel avec lequel les entreprises collectent, lisent et trient les candidatures – par exemple Workday, Taleo, SAP SuccessFactors, Teamtailor ou Welcome to the Jungle."],
      ["Un CV ATS peut-il avoir une photo ?", "Oui, la photo ne gêne pas la lecture. Elle reste facultative."],
      ["Un PDF convient-il à un ATS ?", "Oui, s’il contient du vrai texte – comme les PDF de PDF Libre. Les CV scannés ou les images enregistrées en PDF ne sont pas lisibles par un ATS."],
    ],
  },
  "lebenslauf-latex": {
    guide: "CV style LaTeX – sans LaTeX",
    name: "CV style LaTeX",
    title: "CV LaTeX sans LaTeX – créer un CV style moderncv en ligne | PDF Libre",
    description: "Créez un CV au look LaTeX, sans LaTeX : police Latin Modern, structure claire façon moderncv, aperçu en direct et téléchargement PDF. Idéal pour les études, la recherche et le doctorat. Gratuit.",
    h1: "CV style LaTeX – sans connaître LaTeX",
    lead: "Le look LaTeX typique avec la police Latin Modern, sans Overleaf, sans paquets et sans erreurs de compilation. Choisissez le modèle « Académique » et remplissez le formulaire.",
    article: [
      ["Pourquoi un CV style LaTeX ?", "En mathématiques, informatique, physique et dans la recherche, les CV faits avec LaTeX (par exemple moderncv ou altacv) sont très répandus : typographie sobre, espacements parfaits, aspect sérieux. L’inconvénient : il faut maîtriser LaTeX, et chaque modification oblige à recompiler. Le modèle « Académique » compose votre CV en Latin Modern – la police par défaut de LaTeX – avec la même structure claire."],
      ["Pour les candidatures à l’université et dans la recherche", "Poste d’assistant de recherche, job étudiant en laboratoire, candidature en master, doctorat, bourse ou institut de recherche : un CV académique présente, en plus de la formation et de l’expérience, les projets, le mémoire, l’expérience d’enseignement et les publications. Ajoutez simplement vos propres sections via « Projets » ou « Informations complémentaires » et renommez-les."],
    ],
    faq: [
      ["Ai-je besoin de LaTeX ou d’Overleaf ?", "Non. Vous remplissez seulement le formulaire, le PDF est composé automatiquement."],
      ["Le style LaTeX est-il compatible ATS ?", "Oui. Contrairement à certains modèles LaTeX avec colonnes et icônes, ce modèle est sur une colonne et contient du texte lisible proprement."],
      ["Puis-je indiquer des publications ?", "Oui. Renommez la section « Informations complémentaires » en « Publications » et listez-les – une par ligne."],
    ],
  },
  "lebenslauf-werkstudent": {
    guide: "CV pour job étudiant, stage et apprentissage",
    name: "CV étudiant",
    title: "CV étudiant pour stage et job étudiant – exemple et modèle gratuits | PDF Libre",
    description: "Créez un CV pour un stage, un job étudiant ou une alternance : exemple avec études, projets et compétences, compatible ATS en PDF. Gratuit et sans inscription.",
    h1: "CV pour job étudiant, stage et apprentissage",
    lead: "Peu d’expérience professionnelle ? Aucun problème : avec vos études, vos projets, vos jobs et vos compétences, votre CV peut quand même être solide. Cliquez sur « Charger un exemple » pour voir un modèle rempli.",
    article: [
      ["Que mettre dans un CV étudiant ?", "Un court profil (quelles études, quelles forces, combien d’heures par semaine), vos études avec spécialités, stages, jobs étudiants et alternance, projets universitaires et personnels (par exemple sur GitHub), compétences comme langages de programmation, outils et logiciels, langues avec niveau (A1–C2) et engagement associatif. Même un job hors de votre domaine montre votre fiabilité et a sa place dans le CV."],
      ["Des projets à la place de l’expérience", "Surtout pour les jobs étudiants en informatique, data science et ingénierie, les projets comptent souvent plus qu’une longue expérience. Décrivez brièvement ce que vous avez construit, avec quelles technologies et quel résultat – et mettez un lien si possible."],
    ],
    faq: [
      ["Quelle longueur pour un CV étudiant ?", "Une page est idéale ; deux pages conviennent si vous avez beaucoup de projets ou d’expériences pertinents."],
      ["Faut-il mentionner le baccalauréat ?", "Oui, avec la mention, tant que vous êtes étudiant ou jeune diplômé."],
      ["Dois-je indiquer mes disponibilités ?", "Pour un job étudiant ou une alternance, oui – par exemple dans le profil : « disponible 15 à 20 heures par semaine »."],
    ],
  },
  "lebenslauf-franzoesisch": {
    guide: "Faire un CV en français – modèle gratuit",
    name: "CV en français",
    title: "Faire un CV en français – modèle de CV gratuit en PDF | PDF Libre",
    description: "Faites votre CV en français : titres en français, format de date usuel et lettre de motivation au même design – ou traduisez votre CV anglais ou allemand avec l’IA. Pour postuler en France, en Belgique, en Suisse, au Luxembourg, au Québec ou en Afrique francophone.",
    h1: "Faire un CV en français",
    lead: "Vous postulez en France, en Belgique, en Suisse romande, au Luxembourg, au Québec ou en Afrique francophone ? Obtenez un CV avec des titres en français – ou traduisez votre CV existant d’un clic.",
    article: [
      ["Le CV en français : les usages", "Un CV en France tient généralement sur une page (deux au maximum pour les profils expérimentés) et commence souvent par une courte ligne d’objectif, le « titre du CV », par exemple « Stagiaire en Data Science » ou « Ingénieur logiciel ». Viennent ensuite « Expérience professionnelle », « Formation », « Compétences », « Langues » et « Centres d’intérêt ». La photo est facultative.", "Expliquez brièvement les diplômes étrangers, par exemple « Abitur (équivalent du baccalauréat) » ou « Bachelor of Science en informatique ». La fonction de traduction de PDF Libre le fait automatiquement."],
      ["Traduire son CV plutôt que le réécrire", "Vous avez déjà un CV en anglais ou en allemand ? Importez-le, allez dans « Vérifier & IA » et choisissez « Traduire → Français ». Postes, diplômes et descriptions sont traduits naturellement ; noms, entreprises, lieux et technologies restent inchangés. Enregistrez d’abord le brouillon pour garder les deux versions."],
      ["Lettre de motivation au même design", "La lettre de motivation se crée ici aussi, dans le même design, avec la formule d’appel « Madame, Monsieur, » et la formule de politesse habituelle. Le brouillon par l’IA suit la langue de l’offre d’emploi."],
    ],
    faq: [
      ["Puis-je passer du français à l’anglais ou à l’allemand ?", "Oui. Les titres se changent à l’étape « Design » ; l’IA traduit les textes à l’étape « Vérifier & IA »."],
      ["Comment écrire les dates dans un CV en français ?", "Le format MM/AAAA est courant, par exemple 09/2024. « aujourd’hui » indique une expérience en cours."],
      ["Comment s’appellent les sections en français ?", "Profil, Expérience professionnelle, Formation, Projets, Compétences, Langues et Informations complémentaires."],
    ],
  },
  "grosse-pdf-verkleinern": {
    guide: "Compresser un gros PDF (jusqu’à 500 Mo)",
    name: "Compresser un gros PDF",
    title: "Compresser un gros PDF – jusqu’à 500 Mo par fichier, gratuit | PDF Libre",
    description: "Compressez de gros PDF en ligne : fichiers jusqu’à 500 Mo, y compris longs scans et catalogues. Sans inscription, sans limite quotidienne, fichiers supprimés aussitôt. Gratuit.",
    h1: "Compresser un gros PDF – même jusqu’à 500 Mo",
    lead: "Beaucoup de services gratuits abandonnent face aux gros fichiers. Ici, vous compressez des PDF jusqu’à 500 Mo – catalogues, plans, présentations ou dossiers scannés de plusieurs centaines de pages.",
    steps: [
      ["Choisir le gros PDF", "Déposez le fichier dans la zone. Pour les très gros fichiers, la progression de l’envoi s’affiche en pourcentage."],
      ["Choisir le niveau", "« Recommandée » convient presque toujours. Pour le fichier le plus petit possible, choisissez « Forte »."],
      ["Télécharger le PDF allégé", "Vous voyez l’espace gagné. Les gros fichiers prennent un peu plus de temps – laissez simplement la fenêtre ouverte."],
    ],
    article: [
      ["Pourquoi mon PDF est-il si lourd ?", "Presque toujours à cause des images : photos en pleine résolution, scans couleur en 600 dpi ou graphiques intégrés depuis des présentations. Le texte prend très peu de place – 500 pages de texte pèsent souvent moins qu’une seule photo de téléphone. La compression ramène justement ces images à une résolution raisonnable et les enregistre plus efficacement."],
      ["Quelle taille maximale ?", "Jusqu’à 500 Mo par fichier et jusqu’à 1 Go par envoi. C’est bien plus que de nombreux services PDF gratuits, qui s’arrêtent souvent à 100 ou 200 Mo. Il n’y a pas de limite quotidienne : compressez autant de fichiers que nécessaire."],
      ["Que devient mon fichier ?", "Le PDF est envoyé de façon chiffrée, traité sur notre serveur en Allemagne et supprimé juste après le téléchargement. Nous ne regardons pas son contenu et ne conservons rien."],
    ],
    faq: [
      ["Puis-je compresser un PDF de 300 Mo ?", "Oui. Les fichiers jusqu’à 500 Mo sont acceptés. Pour une telle taille, comptez une à quelques minutes pour l’envoi et la compression."],
      ["De combien le fichier va-t-il diminuer ?", "Cela dépend du contenu. Les PDF scannés ou riches en images descendent souvent à 10–30 % de leur taille ; les PDF de texte changent peu – ils sont déjà légers."],
      ["Y a-t-il une limite quotidienne ?", "Non. Les outils sont gratuits et sans compte, aussi souvent que vous le souhaitez."],
      ["Et si mon fichier dépasse 500 Mo ?", "Divisez-le d’abord avec « Diviser PDF » – cela se fait dans votre navigateur, sans limite de taille – puis compressez les parties une à une."],
    ],
  },
  "pdf-zu-gross-fuer-email": {
    guide: "PDF trop lourd pour un e-mail ? Comment le réduire",
    name: "PDF trop lourd pour un e-mail",
    title: "PDF trop lourd pour un e-mail ? Passer sous 25 Mo (Gmail) ou 20 Mo (Outlook) | PDF Libre",
    description: "PDF trop volumineux pour l’envoyer ? Compressez-le sous la limite de Gmail (25 Mo) ou d’Outlook (20 Mo). Fichiers jusqu’à 500 Mo, gratuit, sans inscription.",
    h1: "PDF trop lourd pour un e-mail ? Voici comment le réduire",
    lead: "L’e-mail revient ou refuse de partir parce que la pièce jointe est trop lourde ? Compressez le PDF ici – même s’il fait au départ plusieurs centaines de Mo.",
    steps: [
      ["Envoyer le PDF", "Choisissez le PDF trop lourd – jusqu’à 500 Mo."],
      ["Compresser en « Forte »", "Le niveau « Forte » est déjà sélectionné. Il rend le fichier aussi léger que possible, le texte reste net."],
      ["Vérifier la taille et envoyer", "La nouvelle taille s’affiche aussitôt. Si elle est sous la limite de votre messagerie, joignez le fichier."],
    ],
    article: [
      ["Quelle taille pour une pièce jointe ?", "Gmail autorise 25 Mo par e-mail, Outlook 20 Mo. La limite vaut pour tout l’e-mail : plusieurs pièces jointes s’additionnent, et l’encodage à l’envoi grossit chaque pièce jointe d’environ un tiers. Gardez de la marge et restez sous 18 Mo environ pour Gmail."],
      ["Si ça ne passe toujours pas", "Supprimez les pages inutiles ; divisez le PDF avec « Diviser PDF » et envoyez-le en deux e-mails ; ou scannez en noir et blanc plutôt qu’en couleur. Pour les très gros fichiers, un lien cloud (OneDrive, Google Drive) est préférable."],
    ],
    faq: [
      ["Comment réduire un PDF pour Gmail ?", "Envoyez-le ici, choisissez « Forte » et téléchargez le résultat. Sous 18 Mo environ, il passe sans problème dans un e-mail Gmail (limite 25 Mo)."],
      ["Mon PDF fait 200 Mo – ça marche ?", "Oui, les fichiers jusqu’à 500 Mo sont acceptés. Qu’il passe ensuite sous 25 Mo dépend du contenu : pour des scans, c’est souvent le cas ; avec beaucoup de photos, il faudra peut-être aussi le diviser."],
      ["Le texte devient-il flou ?", "Non. Le texte et les traits restent nets, seules les images sont réduites."],
    ],
  },
  "grosse-pdf-zusammenfuegen": {
    guide: "Fusionner de gros PDF (jusqu’à 1 Go)",
    name: "Fusionner de gros PDF",
    title: "Fusionner de gros PDF – 500 Mo par fichier, 1 Go au total, gratuit | PDF Libre",
    description: "Fusionnez de gros fichiers PDF en ligne : jusqu’à 20 fichiers de 500 Mo, jusqu’à 1 Go au total. Idéal pour scans, dossiers et rapports. Gratuit, sans inscription.",
    h1: "Fusionner de gros PDF – jusqu’à 1 Go en une fois",
    lead: "Dossiers, scans, plans ou rapports annuels atteignent vite plusieurs centaines de Mo. Ici, vous fusionnez jusqu’à 20 PDF de 500 Mo chacun en un seul fichier – jusqu’à 1 Go au total.",
    steps: [
      ["Choisir les PDF", "Déposez tous les fichiers d’un coup ou ajoutez-les un par un."],
      ["Définir l’ordre", "Triez les fichiers par glisser-déposer ou avec les flèches."],
      ["Fusionner", "Cliquez sur « Fusionner les PDF ». Les gros fichiers prennent un peu plus de temps – laissez la fenêtre ouverte."],
    ],
    article: [
      ["Combien en une fois ?", "Jusqu’à 20 fichiers par passage, chacun jusqu’à 500 Mo, jusqu’à 1 Go par envoi. Beaucoup de services gratuits limitent la fusion à 100 Mo. Pour aller au-delà, fusionnez en plusieurs passages puis réunissez les résultats."],
      ["Le fichier final est trop lourd ?", "Les tailles s’additionnent lors de la fusion. Si le résultat doit partir par e-mail ou sur un portail, utilisez « Fusionner et compresser » – les deux en une seule étape."],
    ],
    faq: [
      ["Puis-je fusionner deux PDF de 400 Mo ?", "Oui. Chaque fichier peut faire jusqu’à 500 Mo, jusqu’à 1 Go ensemble."],
      ["Mes fichiers sont-ils conservés ?", "Non. Ils sont supprimés juste après le téléchargement."],
    ],
  },
  "grosse-word-datei-in-pdf": {
    guide: "Convertir un gros fichier Word en PDF",
    name: "Gros fichier Word en PDF",
    title: "Convertir un gros fichier Word en PDF – jusqu’à 500 Mo, gratuit | PDF Libre",
    description: "Convertissez de gros documents Word (DOCX, DOC) riches en images en PDF : jusqu’à 500 Mo par fichier au lieu des 15 Mo habituels. Gratuit, sans inscription, mise en page conservée.",
    h1: "Convertir un gros fichier Word en PDF",
    lead: "Mémoire avec beaucoup de figures, manuel, rapport photo ? De nombreux convertisseurs gratuits refusent les fichiers Word dès 15 Mo. Ici, les documents jusqu’à 500 Mo sont convertis.",
    steps: [
      ["Choisir le fichier Word", "DOCX, DOC, ODT ou RTF – jusqu’à 500 Mo."],
      ["Convertir", "Cliquez sur « Convertir en PDF ». Sauts de page, polices et images sont conservés."],
      ["Télécharger le PDF", "Si le PDF est trop lourd à envoyer, compressez-le ensuite en un clic."],
    ],
    article: [
      ["Pourquoi mon fichier Word est-il si lourd ?", "Word enregistre souvent les photos insérées en pleine résolution – un document avec 50 photos de téléphone atteint vite 150 Mo. La conversion en PDF garde la qualité. Pour un fichier plus léger, compressez ensuite le PDF obtenu."],
      ["Pour les mémoires et rapports", "Universités et administrations demandent souvent un PDF. Après la conversion, vérifiez rapidement la table des matières, les numéros de page et les figures. Une police absente est remplacée par une police proche – intégrez les polices dans Word (« Incorporer les polices dans le fichier ») et le PDF sera identique à l’original."],
    ],
    faq: [
      ["Quelle taille pour le fichier Word ?", "Jusqu’à 500 Mo par fichier."],
      ["La mise en page reste-t-elle identique ?", "Oui, dans presque tous les cas. Seules les polices ni intégrées ni disponibles sur le serveur sont remplacées par des polices proches."],
      ["Un ancien fichier DOC fonctionne-t-il ?", "Oui. DOC, DOCX, ODT et RTF sont pris en charge."],
    ],
  },
  "gescanntes-pdf-verkleinern": {
    guide: "Compresser un PDF scanné",
    name: "Compresser un PDF scanné",
    title: "Compresser un PDF scanné – scans jusqu’à 500 Mo, gratuit | PDF Libre",
    description: "PDF scanné trop lourd ? Compressez scans et dossiers de centaines de pages jusqu’à 500 Mo – souvent à un dixième. Gratuit, sans inscription, fichiers supprimés aussitôt.",
    h1: "Compresser un PDF scanné",
    lead: "Les scanners enregistrent souvent en couleur et en haute résolution – un dossier de 200 pages atteint vite 300 Mo. Ici, vous compressez des scans jusqu’à 500 Mo, souvent à une fraction de leur taille.",
    steps: [
      ["Choisir le scan", "Déposez le PDF scanné dans la zone – jusqu’à 500 Mo."],
      ["Choisir le niveau", "« Recommandée » garde tampons et signatures bien lisibles. « Forte » rend le fichier encore plus léger."],
      ["Télécharger", "Vous voyez tout de suite de combien le fichier a diminué."],
    ],
    article: [
      ["Pourquoi les scans sont si lourds", "Pour l’ordinateur, un scan est une photo de chaque page. En 600 dpi couleur, une seule page A4 pèse plusieurs Mo. Pour lire à l’écran et imprimer, 150 à 200 dpi suffisent largement – c’est ce que fait la compression."],
      ["Astuce : rendre le PDF consultable", "Après la compression, ajoutez une couche de texte avec « Rendre un PDF cherchable (OCR) ». Vous pourrez alors chercher des noms et des montants et copier le texte."],
    ],
    faq: [
      ["Mon scan sera-t-il beaucoup plus léger ?", "Les scans couleur en haute résolution descendent souvent à 10–20 % de leur taille d’origine."],
      ["Les signatures restent-elles lisibles ?", "Oui, avec « Recommandée ». Avec « Forte », vérifiez rapidement que les tampons fins sont encore nets."],
      ["Quelle taille pour le scan ?", "Jusqu’à 500 Mo par fichier."],
    ],
  },
  "ilovepdf-alternative": {
    guide: "Alternative gratuite à iLovePDF – avec de plus gros fichiers",
    name: "Alternative à iLovePDF",
    title: "Alternative à iLovePDF – gratuit jusqu’à 500 Mo par fichier | PDF Libre",
    description: "Alternative gratuite à iLovePDF et Smallpdf : fichiers jusqu’à 500 Mo, 1 Go par envoi, sans limite quotidienne, sans inscription, serveurs en Allemagne. Comparaison honnête des limites.",
    h1: "Alternative gratuite à iLovePDF – avec de plus gros fichiers",
    lead: "Les services PDF connus sont bons – jusqu’à ce qu’un fichier soit trop lourd ou que la limite du jour soit atteinte. PDF Libre traite gratuitement des fichiers jusqu’à 500 Mo, sans compte et sans limite quotidienne.",
    steps: [
      ["Choisir un fichier", "Essayez directement ici avec « Compresser PDF » – ou choisissez un autre outil dans la liste."],
      ["Modifier", "Pas de compte, pas d’attente, pas de filigrane."],
      ["Télécharger", "Le fichier est supprimé juste après le téléchargement."],
    ],
    article: [
      { h: "Limites de taille comparées (versions gratuites)", p: ["Les valeurs d’iLovePDF proviennent de sa page de tarifs publique (novembre 2026) et peuvent changer. Avec un compte Premium payant, iLovePDF accepte jusqu’à 4 Go."], table: { head: ["Outil", "PDF Libre (gratuit)", "iLovePDF (gratuit)"], rows: [["Compresser un PDF", "500 Mo", "200 Mo"], ["Fusionner des PDF", "500 Mo par fichier, 1 Go au total", "100 Mo"], ["Diviser un PDF", "dans le navigateur, sans limite", "100 Mo"], ["Word en PDF", "500 Mo", "15 Mo"], ["PDF en Word", "500 Mo", "15 Mo"], ["OCR (reconnaissance de texte)", "500 Mo", "15 Mo"], ["Images en PDF", "dans le navigateur, sans limite", "40 Mo"]] } },
      ["Ce que PDF Libre fait autrement", "Pas de limite quotidienne ni de compte pour les outils courants. Beaucoup d’outils – diviser, faire pivoter, organiser les pages, images en PDF, remplir des formulaires – tournent entièrement dans votre navigateur : le fichier ne quitte pas votre appareil. Le reste est traité sur un serveur en Allemagne et supprimé aussitôt. S’y ajoutent des outils propres à l’Allemagne et à la France : e-factures (ZUGFeRD, XRechnung, lecture Factur-X), modèles de lettres et dossiers de candidature."],
      ["Ce que les autres font mieux", "iLovePDF et Smallpdf proposent plus d’outils, leurs propres applications pour ordinateur et mobile et, avec un compte payant, des fichiers de plusieurs Go. Si vous traitez régulièrement des fichiers de plus de 500 Mo, un compte Premium chez eux ou un logiciel de bureau est le meilleur choix."],
    ],
    faq: [
      ["PDF Libre est-il vraiment gratuit ?", "Oui. Les outils sont gratuits et sans compte. Le site est financé par la publicité – jamais de publicité ni de filigrane dans vos fichiers."],
      ["Y a-t-il une limite quotidienne ?", "Non. Il existe seulement une protection contre les abus automatisés, invisible en usage normal. Les outils d’IA (traduction, résumé…) ont une limite horaire, car ils ont un coût."],
      ["Où mes fichiers sont-ils traités ?", "Les outils du navigateur directement sur votre appareil, les autres sur notre serveur en Allemagne. Les fichiers sont supprimés après le téléchargement."],
      ["PDF Libre est-il lié à iLovePDF ?", "Non. PDF Libre est un projet indépendant. iLovePDF et Smallpdf sont des marques de leurs propriétaires respectifs."],
    ],
  },
};
