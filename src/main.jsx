import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      region: {
        noticeTitle: 'hey Hungry Friend !',
        noticeBody: 'imHungryAF is currently serving up recommendations only in Singapore and Kuala Lumpur, Malaysia for now.',
        noticeMore: 'more cities coming soon...'
      },
      home: {
        tagline: 'Discover the best eats recommended by your favorite influencers',
        findNearby: 'Find Nearby Eats',
        description: 'Get personalized food recommendations from influencers within 60 minutes driving distance based on your current location.',
        findNearMe: 'Find Food Near Me',
        featuredInfluencers: 'Featured Food Influencers',
        testimonial: "\"imHungryAF's recommendations never disappoint!\"",
        within60: 'All recommendations within 60 minutes driving distance from you',
        influencerOnly: 'Only places personally reviewed by food influencers'
      },
      loading: {
        title: 'Finding the best eats near you',
        subtitle: "We're searching imHungryAF's recommendations in your area...",
        gpsFix: 'Trying to get a GPS fix…'
      },
      results: {
        title: 'Nearby Recommendations',
        sortedByLabel: 'Sorted by:',
        sort: {
          nearest: 'Distance (nearest first)',
          furthest: 'Distance (furthest first)'
        },
        minutesAway_one: '{{count}} min away',
        minutesAway_other: '{{count}} mins away',
        distanceKm: '{{value}} km',
        viewOnMaps: 'View on Maps',
        noMap: 'No map available',
        backToHome: 'Back to Home'
      },
      error: {
        titleDenied: 'Location Access Required',
        titleGeneric: "Couldn't get your location",
        tryAgain: 'Try Again',
        refresh: 'Refresh Page',
        paragraph: {
          denied: "We don't have permission to use your location. Enable it for your browser in Settings, then return and try again.",
          timeout: 'It took too long to get a GPS fix. Please try again in an open area or check your connection.',
          unavailable: 'Location is temporarily unavailable. Move to an open area or try again shortly.',
          unknown: "We couldn't access your location. Please try again."
        },
        ios: {
          title: 'iOS: enable Safari location prompts again',
          steps: {
            openSettings: 'Open Settings',
            privacy: 'Tap Privacy & Security',
            locationServices: 'Tap Location Services',
            safariWebsites: 'Tap Safari Websites',
            selectAsk: 'Select Ask Next Time Or When I Share or While Using the App',
            returnHere: 'Return here and tap Try Again'
          },
          note: "If it still doesn't prompt, close this tab and reopen the site."
        }
      },
      noresults: {
        title: 'No Nearby Spots Found',
        description: "We couldn't find any imHungryAF recommended places within 60 minutes of your location. Check back later as we add more recommendations!"
      },
      footer: {
        creditPrefix: '{{year}} imHungryAF. All food recommendations are reviewed by influencers, data manually curated and web app made by',
        creditSuffix: '.',
        privacy: 'This application uses your current location to find nearby recommendations within a 60-minute drive based on typical urban traffic conditions. Your location data is not stored as it is unnecessary.',
        disclaimer: 'This app estimates travel time without relying on external APIs or large country-specific datasets. It combines geodesic and grid-based distance formulas with heuristic adjustments for turns, time of day, curvature penalties, and dynamic speed modeling. The approach excludes detailed road hierarchy, traffic light delays, and day/night factors for simplicity. This lightweight method provides realistic ETAs while respecting user privacy and minimizing data usage.'
      },
      pwa: {
        common: {
          notNow: 'Not now',
          tap: 'Tap',
          select: 'Select',
          confirm: 'Confirm',
          share: 'Share'
        },
        reload: {
          offlineReady: 'Ready to work offline',
          newContentTitle: 'New content available',
          newContentSubtitle: 'Reload to update to the latest version.',
          close: 'Close',
          reload: 'Reload'
        },
        install: {
          browser: {
            ios: 'iOS Safari',
            other: 'Your browser'
          },
          ios: {
            title: 'Add imHungryAF to your Home Screen',
            subtitle: '1-tap access, faster start, offline-friendly',
            addToHome: 'Add to Home Screen'
          },
          android: {
            title: 'Install imHungryAF',
            subtitle: 'Quick access from your Home Screen',
            benefit1: 'Launches faster than a tab',
            benefit2: 'Works offline for last seen content',
            benefit3: 'Feels like a native app',
            addCTA: 'Add to home screen',
            post: {
              title: 'imHungryAF installed',
              subtitle: 'Find it in your app drawer.',
              gotIt: 'Got it'
            }
          }
        }
      },
      places: {
        "1": {
          name: "Spicy Noodle House",
          review: "The dan dan noodles here are absolutely incredible! Perfect spice level and the noodles have the perfect chew."
        },
        "2": {
          name: "Sushi Haven",
          review: "Their omakase is a steal for the quality. The toro melts in your mouth like butter!"
        },
        "3": {
          name: "The Burger Joint",
          review: "Juicy, messy, delicious. Their secret sauce makes these burgers next level."
        },
        "4": {
          name: "Pizza Palace",
          review: "The perfect NY slice - thin crust, slightly charred, with the right cheese-to-sauce ratio."
        },
        "5": {
          name: "Taco Fiesta",
          review: "Authentic street-style tacos with homemade tortillas. The al pastor is a must-try!"
        },
        "6": {
          name: "Chilli Crab Delight",
          review: "The best chilli crab in Singapore! The sauce is rich and flavorful, perfect with mantou."
        },
        "7": {
          name: "Hainanese Chicken Rice Corner",
          review: "Tender chicken with fragrant rice and a trio of sauces that elevate the dish."
        },
        "8": {
          name: "Laksa Paradise",
          review: "A bowl of creamy, spicy laksa that hits all the right notes. The prawns are fresh and juicy."
        },
        "9": {
          name: "Mee Rebus > Yunos N Family",
          review: "one of the best Mee Rebus in Singapore! This family-run stall has been around for decades using a 60 year-old family recipe, and their rich, flavourful gravy paired with yellow noodles is a favourite among locals."
        },
        "10": {
          name: "Yong Tau Foo > Hup Chong Hakka",
          review: "a well-known spot famous for their authentic Hakka-style yong tau foo that always has a long queue! Unlike the usual YTF you find at hawker centers, Hakka yong tau foo is stuffed generously with minced meat instead of fish paste, which gives it a more robust flavour."
        },
        "11": {
          name: "Prata Tsunami > R.K. Eating House",
          review: "opening hours 24/7, making them a go-to supper spot for Singaporeans to satisfy their late night roti prata cravings. This prata tsunami was flooded with 5 different gravy - hence it's name Tsunami. It's got curry and topped with tikka chicken, eggs and sambal."
        },
        "12": {
          name: "Curry Puff > J2 Famous Crispy Curry Puff",
          review: "michelin-recommended, known for their crispy and flaky puffs with flavorful fillings inside. This stall is a favourite among locals and it's definitely rated as one of Singapore's top-rated curry puffs! Each puff is generously stuffed with filling and I tried all the four different flavours they offered, which includes their signature curry chicken, black pepper chicken, sardine and yam paste puff. All of them were freshly prepared and tasted so good!"
        },
        "13": {
          name: "Fried Oxtail Rice > THREE. by Garamika",
          review: "run by three Indonesian-born, Gen Z sisters. Despite their young age, their restaurant has been receiving great reviews for its authentic and homely Indonesian cuisine, with dishes like ayam bakar, gado gado, and oxtail soup. Oxtail is deep-fried to perfection, giving it a crispy outer layer while remaining juicy and tender inside. If you love Indonesian food, this is a spot you don't want to miss!"
        },
        "14": {
          name: "Khao Soi > Kin Leaw Chill Thai Food",
          review: "a rich and aromatic Northern Thai curry noodle dish, with crispy and soft egg noodles and a creamy coconut based broth. This place is known for serving one of the most authentic versions of Khao Soi in Singapore. If you're a fan of Thai food, Kin Leaw Chill Thai Food is a must-visit spot for their authentic thai flavours with an extensive menu of comforting dishes."
        },
        "15": {
          name: "Prawn Noodles > Lao Ban Niang",
          review: "rich, umami-packed broth along with fresh, juicy prawns. Lao Ban Niang is a real hidden gem that not many people know about, but they definitely serve one of the better prawn noodles in Singapore, so if you're ever craving a solid bowl of prawn noodles, definitely check them out!"
        },
        "16": {
          name: "Hor Fun > Kok Sen Restaurant",
          review: "a family-run zi char spot that's not only loved by locals but also Michelin-recommended for their outstanding dishes. Known for their big prawns hor fun, this dish is a crowd favorite for its silky noodles, rich and savory gravy, and juicy prawns cooked to perfection. Kok Sen isn't just about hor fun, they're a must-visit for anyone looking to explore authentic Singapore zi char."
        },
        "17": {
          name: "Korean Donkatsu > Myung Ga (명가) II",
          review: "an authentic Korean donkatsu spot right here in Singapore! serving some of the best Korean-style donkatsu in town, Myung Ga II isn't just about portions, it's about quality, tradition, and a cozy dining experience that feels like a trip to Korea. Their crispy, golden-brown pork cutlets are fried to perfection and paired with their rich, savory sauce, every bite takes you straight to the heart of Korea."
        },
        "18": {
          name: "Bread > Serangoon Garden Bakery & Confectionery",
          review: "classic old-school bakery bread from one of Serangoon's most legendary spots! 🍞✨ From the original ham & cheese to the all-time favorite hot dog buns, these nostalgic breads bring back memories of simpler times."
        },
        "19": {
          name: "Char Kway Teow > No. 18 Zion Road Fried Kway Teow",
          review: "michelin-recommended stall in Zion Hawker Centre! Kway teow noodles are fried to order and topped with fish cake and cockles. The wok hei impresses with its robust flavours and a hint of spiciness, while the cockles impart extra umami. The wait can be long, but is well worth it."
        },
        "20": {
          name: "Pork Bun > Gong Jing Li Qiang Guo Yu",
          review: "hidden away in the bustling streets of Chinatown, we've stumbled upon a true gem - 恭敬李炝锅鱼. While they're known for their sizzling braised fish, we're here for something even more special: their heavenly baozi (steamed pork buns) with over 30 years of history!"
        },
        "21": {
          name: "Prawn Noodles > Fei Zai Pork Rib Prawn Noodles",
          review: "a hidden gem that's been serving up a legacy of incredible prawn noodles since 1954! This legendary spot loads its bowls with succulent prawns, tender pork ribs, and flavorful pig tails, all tossed in a mix of sauces. It's a truly indulgent and hearty meal that's a must-try for any noodle lover!"
        },
        "22": {
          name: "Hokkien Mee > Uncle Peter Hokkien Mee",
          review: "hidden away in a quiet coffeeshop, Uncle Peter serves up a truly satisfying plate of Hokkien Mee. His version is perfectly saucy with a balanced wok hei flavor that will have you coming back for more. Don't forget to add a punch of flavor with their incredible belachan chili! This is a solid plate of noodles that deserves more recognition."
        },
        "23": {
          name: "Pizza > 168 Neapolitan Pizza",
          review: "a hidden pizza gem tucked away in a hawker centre, serving up restaurant-quality Neapolitan-style pizza! Each pie is made to order with a beautifully chewy and charred crust and incredible, fresh toppings. The pepperoni is a definite crowd-pleaser and a must-try for any pizza enthusiast."
        },
        "24": {
          name: "Sichuan Dan Dan Noodles > An Yi Noodles",
          review: "serving up authentic Sichuan flavors, this cozy noodle shop in the CBD is a must-visit! The signature Dan Dan Mian features a flavorful, nutty, and spicy sauce that perfectly coats every noodle. A true taste of Sichuan that's sure to hit the spot for any fan of bold flavors!"
        },
        "25": {
          name: "Omurice > Tsukimi Hamburg",
          review: "an incredible encounter with the legendary Chef Motokichi! This omurice challenge was insane, featuring fluffy tornado eggs, a rich demi-glace, and juicy hamburg steaks. A truly spectacular dish that shows the chef's passion and skill. If you're looking for a legendary omurice experience, this is it!"
        },
        "26": {
          name: "Steak > Wolfgang's Steakhouse Singapore",
          review: "a deep dive into one of Singapore's premier steakhouses! This place is all about high-quality, dry-aged beef, from their massive Porterhouse steaks to a creative take on Bak Kut Teh. The menu is loaded with impressive appetizers and classic, decadent desserts. A truly luxurious dining experience!"
        },
        "27": {
          name: "Brazilian Churrasco Buffet > Brazil Churrasco",
          review: "get ready for a serious meat feast! As Singapore's first churrascaria, this place has been serving up authentic rodizio-style service since 1994. With 14 different cuts of juicy, tender meat brought directly to your table, it's a paradise for meat lovers. The grilled pineapple is a must-try!"
        },
        "28": {
          name: "Chee Cheong Fun > Yat Ka Yan",
          review: "a unique twist on a classic! Yat Ka Yan is famous for their silky rice noodles, especially their creamy chee cheong fun topped with savory bak kwa. A must-try for anyone looking for a unique and flavourful take on a traditional dish."
        },
        "29": {
          name: "Fried Chicken > SIDES by the Sidemen",
          review: "is it worth the hype? This place is a fried chicken lover's paradise, with everything from perfectly crispy wings and tenders to juicy burgers. You can customize the heat level from mild to 'Insane' and choose from a huge selection of dipping sauces, including their delicious secret sauce. A must-try for any fried chicken fan!"
        },
        "30": {
          name: "Hotpot Buffet > Paradise Hotpot",
          review: "an incredible find for hotpot lovers, offering a crazy value-for-money, all-you-can-eat Hong Kong-style buffet! With your own individual pot and a huge variety of meats and other ingredients, it's a hotpot paradise. The free-flow drinks and sides make this a feast you can't miss!"
        },
        "31": {
          name: "Dosa Platter > MTR Singapore",
          review: "a legendary century-old institution for South Indian vegetarian cuisine! This insane Dosa Platter is a masterpiece, loaded with a huge variety of dosas, chutneys, and curries. It's a gigantic and delicious challenge, and a must-visit for any fan of authentic South Indian food."
        },
        "32": {
          name: "Economic Rice Buffet > Xiao He Shan",
          review: "a fantastic find for an affordable and unlimited feast! This all-you-can-eat economic rice buffet offers a huge variety of dishes, giving you the freedom to pile your plate high with as much food as you want. It's a truly incredible deal that delivers on both value and variety."
        },
        "33": {
          name: "Naan Platter > Usman Restaurant",
          review: "an incredible 7kg Pakistani naan platter at a legendary restaurant! This feast is loaded with a variety of freshly baked naans and is perfectly paired with rich, authentic Pakistani curries and meats. It's a delicious and intense challenge, and a must-try for anyone craving an authentic Pakistani food experience."
        },
        "34": {
          name: "Wagyu Beef Ramen > LeNu Chef Wai's Noodle Bar",
          review: "a challenge of epic proportions! This massive 10kg wagyu beef ramen is a true test of a food warrior's will. With a rich and flavourful broth and tender wagyu beef, this is a delicious and intense experience. Think you have what it takes? This is the place to find out!"
        },
        "35": {
          name: "Hokkien Mee > Hokkien Mee @ 309 Hougang Ave 5",
          review: "an incredible find for old-school Hokkien Mee lovers! This hidden gem in Hougang serves up an authentic and delicious plate of Hokkien noodles. Recommended by a fellow food lover, this stall is a must-visit if you're craving a taste of tradition."
        },
        "36": {
          name: "Prata Buffet > Springleaf Prata Place",
          review: "a prata lover's dream! For just $9.90, you get a free-flow, all-you-can-eat prata buffet with a huge variety of flavors, from classic kosong to cheese and onion cheese. Each one is freshly made and served with delicious fish and chicken curries. A truly unbeatable and affordable feast!"
        },
        "37": {
          name: "Paella > Paelah",
          review: "an incredible 50-inch paella challenge at a hidden gem in Redhill! This massive, 30-serving fusion paella is a masterpiece and a true test of a food warrior's will. A delicious and intense experience, this is a must-visit for anyone looking for a unique and impressive paella feast!"
        },
        "38": {
          name: "Nasi Jenganan > Gerai Nenek Obek",
          review: "a hidden gem at Geylang Serai serving an incredible Nasi Jenganan! This massive 8kg platter is loaded with rich peanut gravy over fluffy rice, along with a variety of delicious ingredients. It's a true test of a foodie's appetite and a must-try for a unique and flavourful experience."
        },
        "39": {
          name: "Hainanese Chicken Rice > Ji Zai Ji (鸡仔记)",
          review: "my go-to spot for years, this incredible Hainanese Boneless Chicken Rice is a true hidden gem in the basement of Golden Mile hawker centre. With perfectly cooked chicken and fragrant rice, this is a chicken rice experience like no other!"
        },
        "40": {
          name: "Indian Curries > Gandhi Restaurant",
          review: "an incredible find for a true Indian food feast! This legendary restaurant in Little India offers unlimited curries served on traditional banana leaves. With unique Singapore and Malaysian influences on classic Indian dishes and must-trys like the Onion and Ginger Chicken, it’s a feast for all the senses!"
        },
        "41": {
          name: "Satay Beehoon > Guan Heng Cooked Food",
          review: "an absolute hidden gem in Yishun that serves an incredible Satay Beehoon! This dish is so good that it completely changed my mind about it. The queue is insane and they sell out fast, but it's worth the wait for this delicious Singaporean delicacy!"
        },
        "42": {
          name: "Mala Hotpot > A Hot Hideout",
          review: "a hidden gem for Mala lovers! This place serves up the biggest and possibly best Mala in Singapore, with a huge 8kg bowl of spicy, numbing goodness. The signature Mala Collagen Soup is a game-changer, making this a definite go-to spot for an unforgettable Mala feast!"
        },
        "43": {
          name: "Moonlight Horfun > Keng Eng Kee Seafood",
          review: "a challenging feast of epic proportions! This massive 7kg Moonlight Horfun is a testament to the heritage and innovation of KEK Seafood. Chef Wayne's addition of luxurious A5 Wagyu beef takes this iconic dish to a whole new level. A must-try for any fan of Zi Char cuisine!"
        },
        "44": {
          name: "Fried Chicken Burger > Mahmud's Tandoor",
          review: "an incredible find for a fried chicken burger! This halal-certified spot serves up an epic 6kg monster burger with a unique Indian-inspired twist. With its delicious masala seasoning and grilled or fried variations, it's a must-try for any food lover!"
        },
        "45": {
          name: "BBQ Western Food Platter > Mad Charcoal",
          review: "an absolute must-try for any fan of Western cuisine! This place serves up a massive 9kg BBQ platter with legendary chicken chop and tender beef cheeks, brisket, and pork ribs. With amazing sides like sweet potato fries and grilled pineapple, it's a charcoal-grilled feast you won't forget!"
        }
      }
    }
  },
  'zh-Hans': {
    translation: {
      region: {
        noticeTitle: '嗨，吃货朋友！',
        noticeBody: 'imHungryAF 目前仅支持在 新加坡 和 马来西亚吉隆坡 提供推荐。',
        noticeMore: '更多城市即将上线…'
      },
      home: {
        tagline: '发现你最喜欢的美食博主推荐的好吃去处',
        findNearby: '查找附近美食',
        description: '根据你当前定位，在60分钟车程范围内获取由美食博主推荐的餐厅。',
        findNearMe: '查找我附近的美食',
        featuredInfluencers: '精选美食博主',
        testimonial: '“imHungryAF 的推荐从不让人失望！”',
        within60: '所有推荐均在你60分钟车程范围内',
        influencerOnly: '仅收录亲自探店过的博主推荐'
      },
      loading: {
        title: '正在为你查找附近的美食',
        subtitle: '我们正在搜索你所在区域的 imHungryAF 推荐…',
        gpsFix: '正在尝试获取定位…'
      },
      results: {
        title: '附近推荐',
        sortedByLabel: '排序：',
        sort: {
          nearest: '距离（由近到远）',
          furthest: '距离（由远到近）'
        },
        minutesAway: '{{count}} 分钟路程',
        distanceKm: '{{value}} 公里',
        viewOnMaps: '在地图中查看',
        noMap: '暂无地图',
        backToHome: '返回首页'
      },
      error: {
        titleDenied: '需要开启定位权限',
        titleGeneric: '无法获取你的定位',
        tryAgain: '重试',
        refresh: '刷新页面',
        paragraph: {
          denied: '我们没有使用你位置信息的权限。请在浏览器的设置中启用定位，然后返回并重试。',
          timeout: '获取 GPS 定位超时。请在空旷区域重试，或检查网络连接。',
          unavailable: '定位暂时不可用。请移动到空旷区域或稍后再试。',
          unknown: '我们无法获取你的位置信息。请重试。'
        },
        ios: {
          title: 'iOS：重新启用 Safari 的定位提示',
          steps: {
            openSettings: '打开 设置',
            privacy: '点击 隐私与安全性',
            locationServices: '点击 定位服务',
            safariWebsites: '点击 Safari 网站',
            selectAsk: '选择 “下次询问或分享时” 或 “使用 App 期间”',
            returnHere: '返回此页面并点击 重试'
          },
          note: '如果仍未弹出提示，请关闭此标签页并重新打开本站。'
        }
      },
      noresults: {
        title: '未找到附近地点',
        description: '在你的位置 60 分钟车程内未找到任何 imHungryAF 推荐的地点。我们会不断新增更多推荐，敬请期待！'
      },
      footer: {
        creditPrefix: '{{year}} imHungryAF。所有美食推荐均由博主亲自评测，数据人工整理，网页由',
        creditSuffix: '制作。',
        privacy: '本应用会使用你的当前位置，在典型城市交通条件下查找 60 分钟车程内的推荐。你的位置信息不会被存储，因为没有必要。',
        disclaimer: '本应用在估算行程时间时不依赖外部 API 或大型的国家级数据集。它结合大地测量与网格距离公式，并通过转向次数、时间段、曲率惩罚以及动态速度建模等启发式调整进行估算。为简化实现，该方法未纳入精细的道路层级、交通灯延迟与昼夜因素。这种轻量方案在尊重隐私、尽量减少数据使用的同时，提供较为真实的到达时间估计。'
      },
      pwa: {
        common: {
          notNow: '暂不',
          tap: '点击',
          select: '选择',
          confirm: '确认',
          share: '共享'
        },
        reload: {
          offlineReady: '已准备好离线使用',
          newContentTitle: '有新内容可用',
          newContentSubtitle: '重新加载以更新到最新版本。',
          close: '关闭',
          reload: '重新加载'
        },
        install: {
          browser: {
            ios: 'iOS Safari',
            other: '你的浏览器'
          },
          ios: {
            title: '将 imHungryAF 添加到主屏幕',
            subtitle: '一键进入、更快启动、离线友好',
            addToHome: '添加到主屏幕'
          },
          android: {
            title: '安装 imHungryAF',
            subtitle: '从主屏幕快速进入',
            benefit1: '比浏览器标签页启动更快',
            benefit2: '可离线查看上次内容',
            benefit3: '更接近原生应用的体验',
            addCTA: '添加到主屏幕',
            post: {
              title: 'imHungryAF 已安装',
              subtitle: '在应用抽屉中找到它。',
              gotIt: '知道了'
            }
          }
        }
      },
      places: {
        "1": {
          name: "辣味面馆",
          review: "这里的担担面太惊艳！辣度刚刚好，面条弹牙有嚼劲。"
        },
        "2": {
          name: "寿司天堂",
          review: "他们的主厨配席性价比超高，金枪鱼大腹像黄油一样在口中融化。"
        },
        "3": {
          name: "汉堡小馆",
          review: "多汁、放纵、好吃到爆。那款秘制酱让汉堡直接升华。"
        },
        "4": {
          name: "披萨宫殿",
          review: "正宗纽约薄片——薄脆微焦，奶酪与酱汁比例刚刚好。"
        },
        "5": {
          name: "塔可嘉年华",
          review: "地道街头风味，手工玉米饼。牧场烤肉口味一定要试！"
        },
        "6": {
          name: "辣椒螃蟹之家",
          review: "新加坡最好吃的辣椒螃蟹！酱汁浓郁入味，配馒头绝配。"
        },
        "7": {
          name: "海南鸡饭角落",
          review: "鸡肉鲜嫩、米饭喷香，三款蘸酱把风味推到新高度。"
        },
        "8": {
          name: "叻沙乐园",
          review: "一碗浓郁香辣的叻沙，鲜虾肥美多汁，口口满足。"
        },
        "9": {
          name: "马来卤面 > Yunos N Family",
          review: "新加坡最棒的马来卤面之一！这家家庭经营的摊位传承了 60 年的家族秘方，和他们的富有、风味的酱汁配上黄面，是本地人最爱的食物之一。"
        },
        "10": {
          name: "酿豆腐 > Hup Chong Hakka",
          review: "以地道客家式酿豆腐闻名，常常大排长龙！与一般以鱼浆为主的版本不同，客家酿豆腐使用碎肉填馅，风味更为浓郁。"
        },
        "11": {
          name: "海啸拉饼 > R.K. Eating House",
          review: "全天 24/7 营业，是新加坡人宵夜吃 prata 的首选。这份“海啸拉饼”被 5 种不同酱汁彻底淹没——因此得名。上面还铺了烤鸡、鸡蛋和参巴辣椒。"
        },
        "12": {
          name: "咖喱角 > J2 Famous Crispy Curry Puff",
          review: "米其林推荐！以酥脆分层的外皮和香浓馅料著称。本地人超爱，也被评为新加坡顶级咖喱角之一！四种口味：招牌咖喱鸡、黑胡椒鸡、沙丁鱼和芋泥，现做现炸，样样都好吃。"
        },
        "13": {
          name: "炸牛尾饭 > THREE. by Garamika",
          review: "由三位印尼出生的 Z 世代姐妹经营。餐馆以家常、地道的印尼菜闻名，如烤鸡、什锦沙拉与牛尾汤。牛尾炸得外酥里嫩、多汁香滑。喜欢印尼菜的你千万别错过！"
        },
        "14": {
          name: "咖喱金面（Khao Soi）> Kin Leaw Chill Thai Food",
          review: "北泰招牌咖喱面，脆与软的蛋面同碗，椰奶汤底浓郁芳香。这里以正宗著称，菜单丰富、泰味十足，必访！"
        },
        "15": {
          name: "虾面 > Lao Ban Niang",
          review: "汤头厚实鲜甜，搭配鲜嫩多汁的虾。低调宝藏摊，供应新加坡数一数二的虾面——想来一碗扎实好面，别错过！"
        },
        "16": {
          name: "河粉 > Kok Sen Restaurant",
          review: "家族经营的煮炒名店，并获米其林推荐。大虾河粉以滑溜面条、浓香咸鲜的卤汁与多汁大虾取胜。想体验正宗新加坡煮炒，这里必去。"
        },
        "17": {
          name: "韩式炸猪排 > Myung Ga (명가) II",
          review: "地道韩式炸猪排！外酥里嫩、金黄香脆，配上浓郁咸香的酱汁，每一口都像瞬移到韩国。这里不止分量，更讲究品质与传统。"
        },
        "18": {
          name: "面包 > Serangoon Garden Bakery & Confectionery",
          review: "老字号烘焙坊的经典古早味！从原味火腿芝士到人气热狗包，这些怀旧面包一口回到童年。"
        },
        "19": {
          name: "炒粿条 > No. 18 Zion Road Fried Kway Teow",
          review: "米其林推荐摊位！现点现炒，上铺鱼饼与鲜蚝。镬气十足、风味浓厚并带微微辣意，蚝更添鲜味层次。等再久也值得。"
        },
        "20": {
          name: "猪肉包 > Gong Jing Li Qiang Guo Yu",
          review: "藏在牛车水热闹街巷的宝藏店。虽以铁锅鱼闻名，我们此行为他们传承 30 多年的包子而来：鲜肉馅香气扑鼻！"
        },
        "21": {
          name: "虾面 > Fei Zai Pork Rib Prawn Noodles",
          review: "自 1954 年起的传奇老店！一碗装满鲜虾、嫩排骨与猪尾，拌入多种酱料，丰盛又满足，面食控必试。"
        },
        "22": {
          name: "福建面 > Uncle Peter Hokkien Mee",
          review: "隐身静谧咖啡店的一盘好面。湿润度拿捏刚好、镬气平衡，让人回味。再来一勺霸辣酱（峇拉煎）更添风味！"
        },
        "23": {
          name: "披萨 > 168 Neapolitan Pizza",
          review: "小贩中心里的隐藏宝藏，做出餐厅水准的那不勒斯披萨！饼底筋道带焦香，配料新鲜出色。意式腊肠更是人气王，必点。"
        },
        "24": {
          name: "四川担担面 > An Yi Noodles",
          review: "主打正宗川味，这家 CBD 面馆必去！招牌担担面坚果香、椒麻与辣味并存，酱汁紧紧裹住每根面——一口就是四川的味道。"
        },
        "25": {
          name: "蛋包饭 > Tsukimi Hamburg",
          review: "与传奇主厨 Motokichi 相遇！松软龙卷蛋、醇厚半汁酱、加上多汁汉堡排，华丽又美味，尽显厨师的热情与功力。想要传奇级的蛋包饭体验，就来这里！"
        },
        "26": {
          name: "牛排 > Wolfgang's Steakhouse Singapore",
          review: "新加坡顶级干式熟成牛排殿堂！从巨型 T 骨到创意版“肉骨茶”，菜单还有丰富前菜与经典奢华甜品。一次真正奢华的用餐体验。"
        },
        "27": {
          name: "巴西烤肉自助 > Brazil Churrasco",
          review: "做好迎接硬核吃肉局！作为新加坡首家烤肉餐厅，自 1994 年起以正宗轮转式桌边服务闻名。14 种不同部位轮番上桌，烤菠萝更是必点！"
        },
        "28": {
          name: "猪肠粉 > Yat Ka Yan",
          review: "经典玩出新意！以顺滑米卷著称，尤其是浇上奶香酱、再铺香甜肉干的招牌猪肠粉。独特又好吃，必试。"
        },
        "29": {
          name: "炸鸡 > SIDES by the Sidemen",
          review: "值得名气吗？这里是炸鸡爱好者的天堂：从酥脆鸡翅、鸡柳到多汁汉堡一应俱全。辣度从微辣到“疯狂”可选，蘸酱选择巨多，秘密酱尤其好吃。"
        },
        "30": {
          name: "火锅自助 > Paradise Hotpot",
          review: "火锅控的福音！超高性价比的港式自助，一人一锅、肉类与配料选择超多。饮料与小食无限续，绝不能错过的饱腹盛宴！"
        },
        "31": {
          name: "多萨拼盘 > MTR Singapore",
          review: "南印素食的百年传奇！疯狂的大份多萨拼盘，装满各式多萨、酸辣酱与咖喱。巨大又好吃，正宗南印粉必访。"
        },
        "32": {
          name: "经济饭自助 > Xiao He Shan",
          review: "平价又能吃到饱！自助式经济饭菜品选择超多，想装多少就装多少。超值且多样。"
        },
        "33": {
          name: "烤饼拼盘 > Usman Restaurant",
          review: "7 公斤巴基斯坦烤饼巨盘！多款新鲜出炉的馕饼，完美搭配地道的咖喱与肉类。好吃又硬核，想要正宗体验必试。"
        },
        "34": {
          name: "和牛拉面 > LeNu Chef Wai's Noodle Bar",
          review: "10 公斤级和牛拉面挑战！汤头浓郁香醇，和牛软嫩入味。一次美味而强度拉满的体验，敢来战吗？"
        },
        "35": {
          name: "福建面 > Hokkien Mee @ 309 Hougang Ave 5",
          review: "老派福建面的宝藏！后港的隐藏小店，炒出地道又好吃的一盘面。朋友强烈推荐，想找传统味就来。"
        },
        "36": {
          name: "拉饼自助 > Springleaf Prata Place",
          review: "拉饼控的天堂！只要 $9.90 就能无限量吃，从原味 kosong 到芝士与洋葱芝士。现点现做，配鱼咖喱与鸡咖喱，超划算的饱腹之选。"
        },
        "37": {
          name: "西班牙海鲜饭 > Paelah",
          review: "惊人的 50 英寸海鲜饭挑战！可供 30 人分享的融合海鲜饭，既壮观又美味。想找独特而震撼的海鲜饭盛宴，来这里就对了！"
        },
        "38": {
          name: "Nasi Jenganan > Gerai Nenek Obek",
          review: "芽笼士乃的隐藏宝藏，招牌 Nasi Jenganan！8 公斤巨盘，松软米饭淋上浓郁花生酱，配上多款配菜。对胃口是挑战，也是一次独特又香浓的体验。"
        },
        "39": {
          name: "海南鸡饭 > Ji Zai Ji (鸡仔记)",
          review: "我多年的心头好！藏在金山巴刹熟食中心地下一层的低调宝藏。鸡肉火候恰到好处、米饭喷香，这份鸡饭独一无二！"
        },
        "40": {
          name: "印度咖喱 > Gandhi Restaurant",
          review: "真正的印度菜盛宴！小印度的传奇餐厅，在传统香蕉叶上供应无限量咖喱。把新马元素融入经典印度菜，像洋葱姜鸡等都是必点——色香味俱全！"
        },
        "41": {
          name: "沙爹米粉 > Guan Heng Cooked Food",
          review: "义顺的隐藏宝藏，沙爹米粉超乎想象地好吃！让我完全改观。排队夸张、很快卖完，但为了这份新加坡经典，值得等待！"
        },
        "42": {
          name: "麻辣香锅 > A Hot Hideout",
          review: "麻辣爱好者的秘密基地！这里端出可能是新加坡最大、也可能最好吃的麻辣——一大锅 8 公斤，麻中带辣又带麻。招牌胶原麻辣汤底是游戏规则改变者，吃完难忘！"
        },
        "43": {
          name: "月光河粉 > Keng Eng Kee Seafood",
          review: "气势磅礴的 7 公斤月光河粉！既传承也创新。主厨 Wayne 加入奢华 A5 和牛，把这道招牌菜提升到全新高度。煮炒迷必试！"
        },
        "44": {
          name: "炸鸡汉堡 > Mahmud's Tandoor",
          review: "超强的炸鸡汉堡！清真认证，6 公斤巨无霸，带独特的印度风味。马萨拉调味迷人，可烤可炸，吃货必试！"
        },
        "45": {
          name: "BBQ 西式拼盘 > Mad Charcoal",
          review: "任何西式烧烤爱好者都该一试！9 公斤超大 BBQ 拼盘，传奇鸡扒与嫩滑牛脸颊、胸肉、排骨一应俱全；配地瓜条与烤菠萝，炭火香气难忘！"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-Hans'],
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false }
  });

const syncHtmlLang = (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
};
syncHtmlLang(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', syncHtmlLang);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);