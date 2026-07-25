import { useState, useRef, useEffect } from 'react'
import './App.css'

// ── Data ──────────────────────────────────────────────────────────────────────

const GIFTS = [
  { id: 1,  name: 'Clover Pin #88880',    img: 'https://nft.fragment.com/gift/cloverpin-88880.webp',      price: '88.88',  currency: 'usdt', discount: false, attrs: { Model: 'Balloon',   Symbol: 'Bishop',   Backdrop: 'Sapphire' } },
  { id: 2,  name: 'Swiss Watch #20527',   img: 'https://nft.fragment.com/gift/swisswatch-20527.webp',     price: '650.00', currency: 'usdt', discount: true,  attrs: { Model: 'Classic',   Symbol: 'Crown',    Backdrop: 'Gold'     } },
  { id: 3,  name: 'Pet Snake #88880',     img: 'https://nft.fragment.com/gift/petsnake-88880.webp',       price: '25.00',  currency: 'ton',  discount: false, attrs: { Model: 'Coiled',    Symbol: 'Serpent',  Backdrop: 'Emerald'  } },
  { id: 4,  name: 'Instant Ramen #13653', img: 'https://nft.fragment.com/gift/instantramen-13653.webp',   price: '15.00',  currency: 'usdt', discount: false, attrs: { Model: 'Bowl',      Symbol: 'Ramen',    Backdrop: 'Red'      } },
  { id: 5,  name: 'Faith Amulet #70613',  img: 'https://nft.fragment.com/gift/faithamulet-70613.webp',    price: '9.99',   currency: 'usdt', discount: false, attrs: { Model: 'Pendant',   Symbol: 'Eye of Horus', Backdrop: 'Blue' } },
  { id: 6,  name: 'Chill Flame #99086',   img: 'https://nft.fragment.com/gift/chillflame-99086.webp',     price: '4.00',   currency: 'ton',  discount: false, attrs: { Model: 'Wave',      Symbol: 'Flame',    Backdrop: 'Purple'   } },
  { id: 7,  name: 'Money Pot #56229',     img: 'https://nft.fragment.com/gift/moneypot-56229.webp',       price: '6.10',   currency: 'usdt', discount: false, attrs: { Model: 'Pot',       Symbol: 'Coin',     Backdrop: 'Green'    } },
  { id: 8,  name: 'Vice Cream #280373',   img: 'https://nft.fragment.com/gift/vicecream-280373.webp',     price: '3.50',   currency: 'ton',  discount: false, attrs: { Model: 'Soft',      Symbol: 'Ice Cream',Backdrop: 'Pink'     } },
  { id: 9,  name: 'Vice Cream #195983',   img: 'https://nft.fragment.com/gift/vicecream-195983.webp',     price: '3.00',   currency: 'ton',  discount: false, attrs: { Model: 'Soft',      Symbol: 'Ice Cream',Backdrop: 'Mint'     } },
  { id: 10, name: 'Neko Helmet #12827',   img: 'https://nft.fragment.com/gift/nekohelmet-12827.webp',     price: '288.00', currency: 'usdt', discount: true,  attrs: { Model: 'Neko',      Symbol: 'Cat Mask', Backdrop: 'Night'    } },
  { id: 11, name: 'Vice Cream #170895',   img: 'https://nft.fragment.com/gift/vicecream-170895.webp',     price: '4.00',   currency: 'ton',  discount: false, attrs: { Model: 'Soft',      Symbol: 'Ice Cream',Backdrop: 'Berry'    } },
  { id: 12, name: 'Snake Box #98030',     img: 'https://nft.fragment.com/gift/snakebox-98030.webp',       price: '5.00',   currency: 'usdt', discount: false, attrs: { Model: 'Box',       Symbol: 'Serpent',  Backdrop: 'Olive'    } },
  { id: 13, name: 'Lunar Snake #14774',   img: 'https://nft.fragment.com/gift/lunarsnake-14774.webp',     price: '5.00',   currency: 'usdt', discount: false, attrs: { Model: 'Lunar',     Symbol: 'Serpent',  Backdrop: 'Black'    } },
  { id: 14, name: 'Chill Flame #17210',   img: 'https://nft.fragment.com/gift/chillflame-17210.webp',     price: '5.00',   currency: 'usdt', discount: false, attrs: { Model: 'Wave',      Symbol: 'Flame',    Backdrop: 'Ice'      } },
  { id: 15, name: 'Vice Cream #41050',    img: 'https://nft.fragment.com/gift/vicecream-41050.webp',      price: '5.00',   currency: 'usdt', discount: false, attrs: { Model: 'Soft',      Symbol: 'Ice Cream',Backdrop: 'Violet'   } },
  { id: 16, name: 'Swiss Watch #3098',    img: 'https://nft.fragment.com/gift/swisswatch-3098.webp',      price: '718.00', currency: 'usdt', discount: false, contract: true, attrs: { Model: 'Classic', Symbol: 'Crown', Backdrop: 'Silver' } },
  { id: 17, name: 'Swiss Watch #13346',   img: 'https://nft.fragment.com/gift/swisswatch-13346.webp',     price: '610.00', currency: 'usdt', discount: false, contract: true, attrs: { Model: 'Classic', Symbol: 'Crown', Backdrop: 'Bronze' } },
  { id: 18, name: 'Stellar Rocket #32671',img: 'https://nft.fragment.com/gift/stellarrocket-32671.webp',  price: '49.00',  currency: 'usdt', discount: false, attrs: { Model: 'Rocket',    Symbol: 'Star',     Backdrop: 'Space'    } },
  { id: 19, name: 'Scared Cat #878',      img: 'https://nft.fragment.com/gift/scaredcat-878.webp',        price: '280.00', currency: 'usdt', discount: false, attrs: { Model: 'Cat',       Symbol: 'Spooky Cat',Backdrop: 'Dark'    } },
  { id: 20, name: 'Clover Pin #121191',   img: 'https://nft.fragment.com/gift/cloverpin-121191.webp',     price: '25.00',  currency: 'usdt', discount: false, attrs: { Model: 'Balloon',   Symbol: 'Bishop',   Backdrop: 'Teal'     } },
] as const

const USERNAMES = [
  { id: 1,  name: '@g8kkk',   img: 'https://nft.fragment.com/username/g8kkk.webp',    price: '41.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 2,  name: '@btdddd',  img: 'https://nft.fragment.com/username/btdddd.webp',   price: '20.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 3,  name: '@wmkkkk',  img: 'https://nft.fragment.com/username/wmkkkk.webp',   price: '18.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 4,  name: '@zhanleng',img: 'https://nft.fragment.com/username/zhanleng.webp', price: '18.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 5,  name: '@qdxdx',   img: 'https://nft.fragment.com/username/qdxdx.webp',    price: '38.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 6,  name: '@toupin',  img: 'https://nft.fragment.com/username/toupin.webp',   price: '88.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 7,  name: '@l8boss',  img: 'https://nft.fragment.com/username/l8boss.webp',   price: '35.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 8,  name: '@oo22u',   img: 'https://nft.fragment.com/username/oo22u.webp',    price: '28.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 9,  name: '@henpay',  img: 'https://nft.fragment.com/username/henpay.webp',   price: '38.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 10, name: '@nibil',   img: 'https://nft.fragment.com/username/nibil.webp',    price: '25.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 11, name: '@leakun',  img: 'https://nft.fragment.com/username/leakun.webp',   price: '28.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 12, name: '@c7trx',   img: 'https://nft.fragment.com/username/c7trx.webp',    price: '38.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 13, name: '@cican',   img: 'https://nft.fragment.com/username/cican.webp',    price: '38.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 14, name: '@raoze',   img: 'https://nft.fragment.com/username/raoze.webp',    price: '45.00',   currency: 'usdt', discount: true,  contract: true  },
  { id: 15, name: '@niulh',   img: 'https://nft.fragment.com/username/niulh.webp',    price: '20.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 16, name: '@niuiw',   img: 'https://nft.fragment.com/username/niuiw.webp',    price: '20.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 17, name: '@k88888s', img: 'https://nft.fragment.com/username/k88888s.webp',  price: '20.00K',  currency: 'ton',  discount: false, contract: true  },
  { id: 18, name: '@nnnnge',  img: 'https://nft.fragment.com/username/nnnnge.webp',   price: '68.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 19, name: '@niuiq',   img: 'https://nft.fragment.com/username/niuiq.webp',    price: '20.00',   currency: 'usdt', discount: false, contract: true  },
  { id: 20, name: '@flczx',   img: 'https://nft.fragment.com/username/flczx.webp',    price: '28.00',   currency: 'usdt', discount: false, contract: true  },
]

const COLLECTIONS = [
  'Astral Shards','B-Day Candle','Big Year','Bow Tie','Bunny Muffin','Candy Cane',
  'Chill Flame','Clover Pin','Cookie Heart','Crystal Ball','Cupid Charm','Desk Calendar',
  "Durov's Caps",'Easter Egg','Eternal Candle','Evil Eye','Faith Amulet','Flying Broom',
  'Fresh Socks','Ginger Cookie','Hanging Star','Happy Brownie','Hex Pot','Holiday Drink',
  'Homemade Cakes','Hypno Lollipop','Ice Cream','Input Key','Instant Ramen','Ionic Dryer',
  'Jack-in-the-Box','Jelly Bunnies','Jester Hat','Jingle Bells','Jolly Chimp',
  "Khabib's Papakha",'Liberty Figure','Light Sword','Lol Pop','Loot Bag','Love Candle',
  'Lunar Snake','Lush Bouquet','Money Pot','Mood Pack','Moon Pendant','Mousse Cake',
  'Nail Bracelet','Neko Helmet','Party Sparkler','Pet Snake','Plush Pepe','Pool Float',
  'Pretty Posy','Record Player','Restless Jar','Sakura Flower','Santa Hat','Scared Cat',
  'Signet Ring','Sleigh Bell','Snake Box','Snoop Cigar','Snoop Dogg','Snow Globe',
  'Spiced Wine','Spring Basket','Spy Agaric','Stellar Rocket','Surge Board','Swag Bag',
  'Swiss Watch','Tama Gadget','Timeless Book','Top Hat','Toy Bear','UFC Strike',
  'Valentine Box','Vice Cream','Victory Medal','Vintage Cigars','Voodoo Doll',
  'Westside Sign','Whip Cupcake','Winter Wreath','Witch Hats','Xmas Stocking',
]

const SYMBOLS = [
  'Acorn','Adesanya','Alarm','Alert Serpent','Anchor','Ancient Urn','Anubis','Apple',
  'Arabian Horse','Arcane Mirror','Astronaut','Avocado','Axe','Aztec Falcon',
  'Baby Bottle','Bamboo','Banana','Banner','Baphomet','Bascinet','Baseball Cap',
  'Basketball','Bearskin','Bee','Beer','Beetle','Bell Pepper','Beret','Bicorne',
  'Bike Helmet','Birthday Cake','Bishop','Blood Drop','Blunt','Boat','Bobble Hat',
  'Bobby Helmet','Bone','Bong','Book','Boombox','Bottle','Bow Tie','Bowler Hat',
  'Bread','Breeze','Bubble Tea','Bug','Bunny Ears','Burger','Cactus','Candle','Cap',
  'Car','Cash','Cat Mask','Celtic Cross','Champagne','Cheese','Cherry','Chick','Chili',
  'Chocolate','Christmas Tree','Cicada','Clubs','Cocktail','Coin','Conch','Corn',
  'Crab','Crescent','Crown','Crystal','Crystal Ball','Cupcake','Cursor','Cute Paw',
  'Dagger','Desert Eagle','Diamond','Dice','Doberman','Dolphin','Donut','Dragonfly',
  'Easter Egg','Egg','Eggplant','Elf Hat','Evil Dragon','Eye of Horus','Fedora',
  'Fenrir','Fight Glove','Firebird','Fireworks','Fish Skeleton','Flag','Flamingo',
  'Flashlight','Flower','Fried Egg','Full Moon','Galaxy','Gear','Gem','Ghost',
  'Gift Box','Gingerbread','Glasses','Gold','Grape','Gravestone','Grenade','Guitar',
  'Hamburger','Heart','Hedgehog','High Heels','Hippo','Holy Grail','Horn','Horseshoe',
  'Hot Drink','Human Scull','Ice Cream','Ice Pop','Illuminati','Imperial Lion',
  'Iron Helmet','Jaws','Jellyfish','Jewel','Jolly Roger','Key','Koala','Ladybug',
  'Leaf','Lemon','Lightning','Lily','Lion Head','Lollipop','Lotus Flower','Love Daisy',
  'Love Letter','Maple Leaf','Mask','Meat Leg','Melon','Money Bag','Moon','Mushroom',
  'Musical Note','Mustache','Neptune','Owl','Palm Trees','Paper Crane','Party Hat',
  'Paw Print','Pear','Pearl','Pegasus','Pencil','Phoenix','Pigeon','Piggy Bank',
  'Pineapple','Pirate Hat','Planet','Plum','Police Hat','Pyramid','Rocket','Rook',
  'Rooster','Rose','Royal Crown','Sakura','Santa Hat','Scissors','Scorpion',
  'Seahorse','Serpent','Shell','Skull','Snowflake','Snowman','Sombrero','Spider',
  'Star','Strawberry','Sunflower','Sword Fight','Telescope','Tooth','Top Hat',
  'Trophy','Tulip','Turkey','Turtle','Unicorn','Viper','Voodoo Doll','Watermelon',
  'Wine Toast','Wizard Hat',
]

const GIFT_FILTERS = ['Collection', 'Model', 'Symbol', 'Background', 'Price']
const USERNAME_FILTERS = ['Price', 'Letters', 'Numbers', 'Underscore']
const NAV_ITEMS = ['Market', 'Rent', 'Activity', 'Rank', 'Storage']

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function TonIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" fill="none">
      <path d="M9.214 0H1.785C.42 0-.446 1.473.241 2.664l4.585 7.947a.778.778 0 0 0 1.348 0l4.585-7.947C11.445 1.475 10.58 0 9.215 0h-.001ZM4.822 8.228l-.999-1.933-2.409-4.308a.42.42 0 0 1 .37-.63h3.037V8.23v-.001Zm4.761-6.242-2.408 4.31-.999 1.932V1.356h3.037a.42.42 0 0 1 .37.63Z" fill="#0098EA"/>
    </svg>
  )
}

function UsdtIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 11" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.22 5.913c-.068.004-.42.025-1.206.025-.628 0-1.07-.018-1.225-.026v.002C2.374 5.808.571 5.39.571 4.889c0-.5 1.803-.919 4.218-1.027v1.635c.158.011.61.038 1.235.038.75 0 1.126-.031 1.196-.037V3.864c2.41.107 4.21.525 4.21 1.025 0 .5-1.8.918-4.21 1.024Zm0-2.22V2.232h3.364V0H1.426v2.23h3.363v1.463C2.056 3.818 0 4.357 0 5.003c0 .645 2.056 1.184 4.79 1.31V11h2.43V6.31C9.95 6.187 12 5.648 12 5.004c0-.645-2.05-1.184-4.78-1.31Z" fill="#26C04C"/>
    </svg>
  )
}

function TgGiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="url(#tgg2)"/>
      <path d="M5.673 11.888c1.175-.642 2.486-1.177 3.711-1.716a194 194 0 0 1 6.361-2.555c.416-.138 1.163-.272 1.237.34-.04.865-.206 1.725-.319 2.585-.287 1.892-.62 3.778-.943 5.664-.112.628-.905.953-1.412.551-1.22-.817-2.449-1.627-3.653-2.463-.394-.398-.029-.969.324-1.253 1.004-.982 2.07-1.816 3.021-2.849.257-.615-.502-.097-.752.062-1.375.94-2.717 1.938-4.167 2.764-.74.405-1.603.06-2.344-.167-.663-.272-1.636-.547-1.064-.963Z" fill="#fff"/>
      <defs><linearGradient id="tgg2" x1="9.477" y1="-5.333" x2="-2.824" y2="14.556" gradientUnits="userSpaceOnUse"><stop stopColor="#34B0DF"/><stop offset="1" stopColor="#1E88D3"/></linearGradient></defs>
    </svg>
  )
}

function DiscountIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M11.27 2.782a1 1 0 0 1 1.46 0l1.83 1.957a1 1 0 0 0 .764.317l2.678-.09a1 1 0 0 1 1.033 1.032l-.09 2.678a1 1 0 0 0 .316.764l1.957 1.83a1 1 0 0 1 0 1.46l-1.957 1.83a1 1 0 0 0-.317.764l.09 2.678a1 1 0 0 1-1.032 1.033l-2.678-.09a1 1 0 0 0-.764.316l-1.83 1.957a1 1 0 0 1-1.46 0l-1.83-1.957a1 1 0 0 0-.764-.317l-2.678.09a1 1 0 0 1-1.033-1.032l.09-2.678a1 1 0 0 0-.316-.764l-1.957-1.83a1 1 0 0 1 0-1.46l1.957-1.83a1 1 0 0 0 .317-.764l-.09-2.678a1 1 0 0 1 1.032-1.033l2.678.09a1 1 0 0 0 .764-.316l1.83-1.957Z" fill="#F7D408"/>
      <path d="M12.355 15.227v-.498c0-.379.08-.727.24-1.044a1.879 1.879 0 0 1 1.843-1.056c.452 0 .832.095 1.14.285.31.191.544.447.701.767.16.317.24.666.24 1.048v.498c0 .379-.08.728-.24 1.048-.16.317-.395.571-.706.762-.31.194-.69.29-1.136.29-.452 0-.832-.096-1.14-.29a1.879 1.879 0 0 1-.702-.762 2.31 2.31 0 0 1-.24-1.048ZM8.113 17l6.5-9.455h1.21L9.322 17h-1.21Z" fill="#303133"/>
    </svg>
  )
}

function ContractIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M10.539 2.563a2 2 0 0 1 2.922 0l1.696 1.815 4.465 4.465 1.815 1.696a2 2 0 0 1 0 2.922l-1.815 1.696-4.465 4.465-1.696 1.815a2 2 0 0 1-2.922 0l-1.696-1.815-4.465-4.465-1.815-1.696a2 2 0 0 1 0-2.922l1.815-1.696 4.465-4.465 1.696-1.815Z" fill="#8F1CFB"/>
      <path d="M18.667 11.999 12 5.332l-6.667 6.667L12 18.665 18.667 12ZM5.333 12h13.334" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18.665 10 12l2-6.667M12 18.665 14 12l-2-6.667" stroke="#FFF" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CartIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.67 10.665v-8H1.337V1.332h2c.368 0 .666.299.666.667v8h8.293l1.333-5.334H5.337V3.332h9.146a.667.667 0 0 1 .646.828l-1.666 6.667a.667.667 0 0 1-.647.505h-9.48a.667.667 0 0 1-.666-.667Zm1.333 4.667a1.333 1.333 0 1 1 0-2.667 1.333 1.333 0 0 1 0 2.667Zm8 0a1.333 1.333 0 1 1 0-2.667 1.333 1.333 0 0 1 0 2.667Z" fill="currentColor"/>
      <path d="M6.667 7.332h2m2 0h-2m0 0v-2 4" stroke="currentColor" strokeWidth="1.333"/>
    </svg>
  )
}

function FavIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {filled
        ? <path d="m8 12.172-4.702 2.632 1.05-5.285-3.956-3.66 5.351-.634L8 .332l2.257 4.893 5.352.635-3.957 3.659 1.05 5.285L8 12.172Z" fill="#F7D408"/>
        : <path d="m8 12.172-4.702 2.632 1.05-5.285-3.956-3.66 5.351-.634L8 .332l2.257 4.893 5.352.635-3.957 3.659 1.05 5.285L8 12.172Zm0-1.528 2.832 1.585-.633-3.182 2.382-2.203-3.222-.382L8 3.515 6.641 6.462l-3.222.382 2.382 2.202-.632 3.183L8 10.644Z" fill="#708499"/>
      }
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.833 11.667H9.167a7.499 7.499 0 0 0-6.64 4.009 8.333 8.333 0 0 1 8.306-9.009V2.5l8.334 6.667-8.334 6.666v-4.166Z"/>
    </svg>
  )
}

function SearchSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>
    </svg>
  )
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}

function SuccessSmIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M8.333 16.667A8.333 8.333 0 1 1 8.333 0a8.333 8.333 0 0 1 0 16.667Zm-.83-5 5.892-5.893-1.179-1.178L7.502 9.31 5.145 6.953 3.967 8.13l3.535 3.536Z" fill="#41BA1D"/>
    </svg>
  )
}

// ── Nav icons ─────────────────────────────────────────────────────────────────

function NavMarket() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M19 9.6458V19C19 19.5523 18.5523 20 18 20H2C1.44772 20 1 19.5523 1 19V9.6458C0.37764 8.9407 0 8.0144 0 7V1C0 0.44772 0.44772 0 1 0H19C19.5523 0 20 0.44772 20 1V7C20 8.0144 19.6224 8.9407 19 9.6458ZM12 7C12 6.44772 12.4477 6 13 6C13.5523 6 14 6.44772 14 7C14 8.1046 14.8954 9 16 9C17.1046 9 18 8.1046 18 7V2H2V7C2 8.1046 2.89543 9 4 9C5.10457 9 6 8.1046 6 7C6 6.44772 6.44772 6 7 6C7.55228 6 8 6.44772 8 7C8 8.1046 8.8954 9 10 9C11.1046 9 12 8.1046 12 7Z" fill="currentColor"/></svg> }
function NavRent()   { return <svg width="20" height="20" viewBox="0 0 20 18" fill="none" stroke="currentColor"><path d="M2 0H18L20 4V17C20 17.5523 19.5523 18 19 18H1C0.44772 18 0 17.5523 0 17V4.00353L2 0ZM11 11V7H9V11H6L10 15L14 11H11ZM17.7639 4L16.7639 2H3.23656L2.23744 4H17.7639Z" fill="currentColor"/></svg> }
function NavActivity(){ return <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor"><path d="M12 19.3137V21.3137H0V19.3137H12ZM12.5858 0L20.3639 7.77818L18.9497 9.19238L17.8891 8.83883L15.4142 11.3137L21.0711 16.9705L19.6568 18.3847L14 12.7279L11.5958 15.132L11.8787 16.2634L10.4644 17.6776L2.68629 9.89954L4.10051 8.48528L5.23188 8.76813L11.5251 2.47487L11.1716 1.41421L12.5858 0Z" fill="currentColor"/></svg> }
function NavRank()   { return <svg width="20" height="20" viewBox="0 0 22 18" fill="none" stroke="currentColor"><path d="M12 13.9381V16H17V18H5V16H10V13.9381C6.05369 13.446 3 10.0796 3 6V0H19V6C19 10.0796 15.9463 13.446 12 13.9381ZM0 2H2V6H0V2ZM20 2H22V6H20V2Z" fill="currentColor"/></svg> }
function NavStorage(){ return <svg width="20" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor"><path d="M3.5 0H14.5C14.8147 0 15.1111 0.14819 15.3 0.4L18 4V19C18 19.5523 17.5523 20 17 20H1C0.44772 20 0 19.5523 0 19V4L2.7 0.4C2.88886 0.14819 3.18525 0 3.5 0ZM15.5 4L14 2H4L2.5 4H15.5ZM6 8H4V10C4 12.7614 6.23858 15 9.00002 15C11.7614 15 14 12.7614 14 10V8H12V10C12 11.6569 10.6568 13 9.00002 13C7.34312 13 6 11.6569 6 10V8Z" fill="currentColor"/></svg> }

const NAV_ICONS = [<NavMarket />, <NavRent />, <NavActivity />, <NavRank />, <NavStorage />]

// ── FilterPopup (shared for Collection & Symbol) ──────────────────────────────

interface FilterPopupProps {
  title: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  onSelectAll: () => void
  onClear: () => void
  onClose: () => void
  onApply: () => void
}

function FilterPopup({ title, items, selected, onToggle, onSelectAll, onClear, onClose, onApply }: FilterPopupProps) {
  const [q, setQ] = useState('')
  const filtered = items.filter(i => i.toLowerCase().includes(q.toLowerCase()))
  const allSelected = items.every(i => selected.includes(i))

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="filter-popup" onClick={e => e.stopPropagation()}>
        <div className="filter-popup__header">
          <span className="filter-popup__title">{title}</span>
          <button className="filter-popup__close" onClick={onClose}><CloseIcon size={20} /></button>
        </div>
        <div className="filter-popup__search">
          <SearchSvg />
          <input
            type="text"
            placeholder="Search"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="filter-popup__search-input"
          />
        </div>
        <div className="filter-popup__list-wrap">
          <button className="filter-popup__row" onClick={onSelectAll}>
            <div className={`filter-popup__checkbox${allSelected ? ' checked' : ''}`}>
              {allSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#17212b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="filter-popup__label">Select all</span>
          </button>
          <div className="filter-popup__sep" />
          <div className="filter-popup__option-list">
            {filtered.map(item => {
              const isChecked = selected.includes(item)
              return (
                <button key={item} className="filter-popup__row" onClick={() => onToggle(item)}>
                  <div className={`filter-popup__checkbox${isChecked ? ' checked' : ''}`}>
                    {isChecked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#17212b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="filter-popup__label">{item}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="filter-popup__footer">
          <button className={`filter-popup__btn-clear${selected.length === 0 ? ' disabled' : ''}`} onClick={onClear} disabled={selected.length === 0}>
            Clear all
          </button>
          <button className="filter-popup__btn-submit" onClick={onApply}>Show results</button>
        </div>
      </div>
    </div>
  )
}

// ── NFT Detail Popup ──────────────────────────────────────────────────────────

interface NftItem {
  id: number
  name: string
  img: string
  price: string
  currency: string
  discount?: boolean
  contract?: boolean
  attrs?: Record<string, string>
}

interface NftDetailPopupProps {
  item: NftItem
  onClose: () => void
  onFav: () => void
  isFaved: boolean
}

function NftDetailPopup({ item, onClose, onFav, isFaved }: NftDetailPopupProps) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="detail-popup" onClick={e => e.stopPropagation()}>
        <button className="detail-popup__close" onClick={onClose}><CloseIcon size={20} /></button>
        <div className="detail-popup__image-box">
          <div className="detail-popup__image">
            <img src={item.img} alt={item.name} referrerPolicy="no-referrer" />
          </div>
          <div className="tag-icon-box">
            {item.discount && <DiscountIcon />}
            {item.contract
              ? <ContractIcon />
              : <TgGiftIcon />
            }
          </div>
        </div>
        <div className="detail-popup__name">{item.name}</div>

        {item.attrs && (
          <div className="detail-popup__info-box">
            {Object.entries(item.attrs).map(([k, v]) => (
              <div key={k} className="detail-popup__info-item">
                <span className="detail-popup__info-label">{k}</span>
                <span className="detail-popup__info-value">{v}</span>
              </div>
            ))}
          </div>
        )}

        <div className="detail-popup__price-box">
          {item.currency === 'ton' ? <TonIcon size={20} /> : <UsdtIcon size={20} />}
          <span className="detail-popup__price-value">{item.price}</span>
        </div>

        <div className="detail-popup__actions">
          <button className="detail-popup__action-btn" aria-label="share">
            <ShareIcon />
          </button>
          <button
            className={`detail-popup__action-btn${isFaved ? ' active-fav' : ''}`}
            aria-label="favourite"
            onClick={onFav}
          >
            <FavIcon filled={isFaved} />
          </button>
          <button
            className={`detail-popup__action-btn${item.contract ? ' disabled' : ''}`}
            aria-label="add to cart"
          >
            <CartIcon size={20} />
          </button>
          <button className="detail-popup__buy-btn">Buy Now</button>
        </div>
      </div>
    </div>
  )
}

// ── Fav Toast ─────────────────────────────────────────────────────────────────

function FavToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fav-toast">
      <SuccessSmIcon />
      <div className="fav-toast__main">
        <div className="fav-toast__title">Added to favorites</div>
        <div className="fav-toast__sub">Go to Storage to view</div>
      </div>
      <button className="fav-toast__action" onClick={onClose}>View</button>
      <button className="fav-toast__close" onClick={onClose}><CloseIcon size={16} /></button>
    </div>
  )
}

// ── NftCard ───────────────────────────────────────────────────────────────────

interface NftCardProps {
  item: NftItem
  onCardClick: (item: NftItem) => void
  onFav: (id: number) => void
  isFaved: boolean
}

function NftCard({ item, onCardClick, onFav, isFaved }: NftCardProps) {
  return (
    <div className="nft-card" onClick={() => onCardClick(item)}>
      <div className="nft-image-container">
        <img src={item.img} alt={item.name} className="nft-img" loading="lazy" referrerPolicy="no-referrer" />
        <div className="tag-icon-box">
          {item.discount && <DiscountIcon />}
          {item.contract ? <ContractIcon /> : <TgGiftIcon />}
        </div>
      </div>
      <div className="nft-info">
        <h3 className="nft-name">{item.name}</h3>
        <div className="price-row">
          <button
            className={`cart-item-btn${item.contract ? ' disabled' : ''}`}
            onClick={e => { e.stopPropagation() }}
            aria-label="Add to cart"
          >
            <CartIcon />
          </button>
          <div className="price-bar">
            <div className="price">
              {item.currency === 'ton' ? <TonIcon /> : <UsdtIcon />}
              <span>{item.price}</span>
            </div>
          </div>
          <button
            className="cart-item-btn"
            onClick={e => { e.stopPropagation(); onFav(item.id) }}
            aria-label="Favourite"
          >
            <FavIcon filled={isFaved} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(0)       // 0=Gifts, 1=Usernames
  const [activeNav, setActiveNav] = useState(0)
  const [search, setSearch] = useState('')
  const [favIds, setFavIds] = useState<number[]>([])

  // Popups
  const [detailItem, setDetailItem] = useState<NftItem | null>(null)
  const [showCollFilter, setShowCollFilter] = useState(false)
  const [showSymFilter, setShowSymFilter] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Filter state
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])

  const currentItems: NftItem[] = activeTab === 0
    ? (GIFTS as unknown as NftItem[]).filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
    : (USERNAMES as NftItem[]).filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  function toggleFav(id: number) {
    setFavIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      if (!prev.includes(id)) setShowToast(true)
      return next
    })
  }

  function handleCollToggle(item: string) {
    setSelectedCollections(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    )
  }
  function handleCollSelectAll() {
    setSelectedCollections(prev => prev.length === COLLECTIONS.length ? [] : [...COLLECTIONS])
  }

  function handleSymToggle(item: string) {
    setSelectedSymbols(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    )
  }
  function handleSymSelectAll() {
    setSelectedSymbols(prev => prev.length === SYMBOLS.length ? [] : [...SYMBOLS])
  }

  const giftFilters = activeTab === 0 ? GIFT_FILTERS : USERNAME_FILTERS

  function handleFilterClick(label: string) {
    if (label === 'Collection') setShowCollFilter(true)
    if (label === 'Symbol') setShowSymFilter(true)
  }

  // Scroll lock when popup open
  const bodyScrollRef = useRef(false)
  const anyPopup = !!detailItem || showCollFilter || showSymFilter
  useEffect(() => {
    if (anyPopup && !bodyScrollRef.current) {
      document.body.style.overflow = 'hidden'
      bodyScrollRef.current = true
    } else if (!anyPopup && bodyScrollRef.current) {
      document.body.style.overflow = ''
      bodyScrollRef.current = false
    }
  }, [anyPopup])

  return (
    <div className="mkts-layout">

      {/* ── Toast ── */}
      {showToast && <FavToast onClose={() => setShowToast(false)} />}

      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <div className="avatar">
            <img src="https://t.me/i/userpic/320/PJ_NMq7CXZkdOn96PPFv2KarbnQ0eS9Sz4og1T1zV6Q.svg" alt="avatar" referrerPolicy="no-referrer" />
          </div>
          <div className="balance-group">
            <div className="balance-item">
              <TonIcon size={14} />
              <span className="value">0.00</span>
              <span className="plus-icon">+</span>
            </div>
            <div className="balance-item">
              <UsdtIcon size={14} />
              <span className="value">0.00</span>
              <span className="plus-icon">+</span>
            </div>
            <div className="balance-item score">
              <span className="score-icon">M</span>
              <span className="value">180.00</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn" aria-label="volume">
            <svg width="17" height="15" viewBox="0 0 17 15" fill="none" stroke="currentColor">
              <path d="M6.57408 10.3708H5.41667L5.72911 13.1483C5.78468 13.6423 5.39813 14.0748 4.901 14.0748H3.93161C3.57406 14.0748 3.25636 13.8467 3.14203 13.5079L2.08333 10.3708H0.833333C0.3731 10.3708 0 9.99769 0 9.53744V4.53741C0 4.07717 0.3731 3.70408 0.833333 3.70408H6.57408L10.9862 0.094195C11.1642 -0.0515217 11.4268 -0.0252717 11.5725 0.152828C11.6334 0.22727 11.6667 0.320495 11.6667 0.416678V13.6581C11.6667 13.8883 11.4801 14.0748 11.25 14.0748C11.1538 14.0748 11.0606 14.0415 10.9862 13.9806L6.57408 10.3708ZM14.8859 10.8633L13.7009 9.67827C14.491 9.06869 15 8.11252 15 7.03744C15 5.84544 14.3744 4.79965 13.4336 4.2104L14.6324 3.01157C15.8663 3.92207 16.6667 5.38627 16.6667 7.03744C16.6667 8.57252 15.9748 9.9461 14.8859 10.8633Z" fill="currentColor"/>
            </svg>
          </button>
          <button className="icon-btn" aria-label="menu"><MenuIcon /></button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="content-view">

        {/* Sub-tabs */}
        <div className="sub-tabs-container">
          <div className="sub-tabs">
            {['Gifts', 'Usernames'].map((t, i) => (
              <button
                key={t}
                className={`sub-tab${activeTab === i ? ' active' : ''}`}
                onClick={() => { setActiveTab(i); setSearch('') }}
              >
                {t}
              </button>
            ))}
            <div className="tabs-line" style={{ transform: `translateX(${activeTab * 100}%)` }} />
          </div>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-bar">
            <SearchSvg />
            <input
              type="text"
              placeholder={activeTab === 0 ? 'Search by gift or attribute' : 'Search by username'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="cart-entry-btn" aria-label="cart">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.702 3.88 0 1.18 1.179 0 3.88 2.702h12.701a.833.833 0 0 1 .798 1.073l-2 6.667a.833.833 0 0 1-.798.594H4.37v1.666h9.167v1.667h-10a.833.833 0 0 1-.834-.833V3.88Zm1.667.489v5h9.593l1.5-5H4.37Zm-.417 13.333a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" fill="currentColor"/>
            </svg>
          </button>
          <button className="dynamic-btn">Dynamic</button>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="filters-scroll">
            {giftFilters.map(f => (
              <button key={f} className="filter-item" onClick={() => handleFilterClick(f)}>
                <span>{f}</span>
                <ChevronDown />
              </button>
            ))}
          </div>
          <button className="list-view-btn" aria-label="list view">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
              <path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/>
            </svg>
          </button>
        </div>

        {/* Grid */}
        <div className="market-content">
          <div className="nft-grid">
            {currentItems.map(item => (
              <NftCard
                key={item.id}
                item={item}
                onCardClick={setDetailItem}
                onFav={toggleFav}
                isFaved={favIds.includes(item.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* ── Bottom nav ── */}
      <nav className="nav-bar">
        <div className="nav-indicator" style={{ transform: `translateX(${activeNav * 100}%)` }}>
          <div className="indicator" />
        </div>
        {NAV_ITEMS.map((label, i) => (
          <button
            key={label}
            className={`nav-item${activeNav === i ? ' active' : ''}`}
            onClick={() => setActiveNav(i)}
          >
            {NAV_ICONS[i]}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Popups ── */}

      {detailItem && (
        <NftDetailPopup
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onFav={() => toggleFav(detailItem.id)}
          isFaved={favIds.includes(detailItem.id)}
        />
      )}

      {showCollFilter && (
        <FilterPopup
          title="Collection"
          items={COLLECTIONS}
          selected={selectedCollections}
          onToggle={handleCollToggle}
          onSelectAll={handleCollSelectAll}
          onClear={() => setSelectedCollections([])}
          onClose={() => setShowCollFilter(false)}
          onApply={() => setShowCollFilter(false)}
        />
      )}

      {showSymFilter && (
        <FilterPopup
          title="Symbol"
          items={SYMBOLS}
          selected={selectedSymbols}
          onToggle={handleSymToggle}
          onSelectAll={handleSymSelectAll}
          onClear={() => setSelectedSymbols([])}
          onClose={() => setShowSymFilter(false)}
          onApply={() => setShowSymFilter(false)}
        />
      )}
    </div>
  )
}
