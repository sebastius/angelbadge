import cups
import qrcode
import sys
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw

# Data to encode

data = input("Enter nickname: ")
print (data)

# Creating an instance of QRCode class
qr = qrcode.QRCode(version = 1,
                   box_size = 10,
                   border = 3)

# Adding data to the instance 'qr'
qr.add_data(data)

qr.make(fit = True)
img = qr.make_image(fill_color = 'black',
                    back_color = 'white')

img.save('MyQRCode2.png')

from aztec_code_generator import AztecCode
aztec_code = AztecCode(data)
aztec_code.save('aztec_code.png', module_size=4, border=0)

achtergrond = Image.open('pasjeachterkant.png')
#qrcodeplaatje = Image.open('MyQRCode2.png')
qrcodeplaatje = Image.open('aztec_code.png')
qrcodeplaatje = qrcodeplaatje.convert('RGBA')
qrcodeplaatje = qrcodeplaatje.resize((255,255), resample = Image.BILINEAR)
qrcodeplaatje = qrcodeplaatje.rotate(60, expand=True,fillcolor=None)

fff = Image.new('RGBA', qrcodeplaatje.size, (255,)*4)

angelbadge = Image.new('RGBA', size=(1016, 648))
#angelbadge = Image.new('RGB', size=(648, 1016))
#achtergrond = achtergrond.rotate(90, expand=True)
angelbadge.paste(achtergrond, (0,0))
angelbadge.paste(qrcodeplaatje, ((1016-102-250),50),qrcodeplaatje)
draw = ImageDraw.Draw(angelbadge)

#draw.rectangle((0,420, 1016, 620), fill=(255,255,255), outline=None)

font = ImageFont.truetype("./Saira-Regular.ttf", 150)
length,height=font.getsize(data)
print(length,height)

if length > 1000:
    font = ImageFont.truetype("./Saira-Regular.ttf", int(150/length*1000))
    length,height=font.getsize(data)
    print(length,height)

draw.rectangle((0, 520-(height/2),1016,530+(height/2)), fill=(255,255,255), outline=None)
draw.text(((1016-length)/2, 520-(height/2)), data, (0, 0, 0), font=font)

angelbadge.save("badge.png", "PNG")

pebble = cups.Connection()
file = "./badge.png"

#pebble.printFile ("Pebble", file, "angelbadge", {})
