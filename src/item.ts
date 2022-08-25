import {getUserAccount} from '@decentraland/EthereumController'
import {getParcel, ILand} from "@decentraland/ParcelIdentity";


export default class MetaViuBillboard {
    private videoTexture: any;
    private rotation: any;
    /*Your nft id here
    billboard_id = YOUR_NFT_ID
    Default is 7777 */
    private billboard_id = 7777;
    private redirect_url = [];

    init() {
    }

    spawn(host: Entity, channel: IChannel) {
        const sign = new Entity()
        sign.setParent(host)

        this.find_ad(host).then()
        sign.addComponent(new GLTFShape('models/MetaViuQuadruple.glb'))
        sign.addComponent(new Transform({}))
        sign.addComponent(
            new OnPointerDown(() => {
                    openExternalURL(this.redirect_url[this.billboard_id])
                },
                {
                    hoverText: 'Interact',
                })
        )
    }

    render_content(host: Entity, url, variable, transform: Transform, type) {
        let QRMaterial = new Material()
        QRMaterial.metallic = 0
        QRMaterial.roughness = 1
        QRMaterial.specularIntensity = 0
        if (type != 'image') {
            this.videoTexture = new VideoTexture(new VideoClip(
                url
            ))
            QRMaterial.albedoTexture = this.videoTexture
        } else {
            QRMaterial.albedoTexture = new Texture(url)
        }

        variable = new Entity()
        variable.setParent(host)
        variable.addComponent(new PlaneShape())
        variable.addComponent(QRMaterial)
        variable.addComponent(
            transform
        )
        if (type != 'image') {
            variable.addComponent(
                new OnPointerDown(() => {
                    this.videoTexture.playing = !this.videoTexture.playing
                })
            )
            this.videoTexture.loop = true;
            this.videoTexture.play()
        }

    }


    async find_ad(host: Entity) {

        const userAccount = await getUserAccount()
        const parcel = await getParcel()
        const transform = host.getComponent(Transform)

        let request = {
            width: transform.scale.x,
            height: transform.scale.y,
            billboard_type: 'Quadruple',
            billboard_id: this.billboard_id,
            type: ['image', 'video'],
            mime_type: ['image/jpeg', 'image/png', 'video/mp4'],
            context: {
                site: {
                    url: 'https://' + this.getSceneId(parcel.land) + '.decentraland.org/',
                },
                user: {
                    account: userAccount,
                },
            },
            vendor: 'Decentraland',
            version: '1.0 Beta',
        }

        let response: any = {}

        try {
            let callUrl = 'https://billboards-api.metaviu.io/show_ad'
            let callResponse = await fetch(callUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',

                },
                method: 'POST',
                body: JSON.stringify(request),
            })
            response = await callResponse.json();

            this.redirect_url[this.billboard_id] = response.redirect_url;
            this.rotation = response.content.side_1.type == 'image' ?  Quaternion.Euler(180, 90, 0):  Quaternion.Euler(360, 90, 0);
            this.render_content(host, response.content.side_1.url, 'side1', new Transform({
                position: new Vector3(3.5, 4.15, 0.14),
                rotation: this.rotation,
                scale: new Vector3(3.2, 2.5, 2)
            }), response.content.side_1.type)

            this.rotation = response.content.side_2.type == 'image' ? Quaternion.Euler(180, -90, 0):   Quaternion.Euler(360, 270, 0);
            this.render_content(host, response.content.side_2.url, 'side2', new Transform({
                position: new Vector3(0.18, 4.15, 0.13),
                rotation: this.rotation,
                scale: new Vector3(3.2, 2.5, 2)
            }), response.content.side_2.type);

            this.rotation = response.content.side_3.type == 'image' ? Quaternion.Euler(180, 360, 0) :  Quaternion.Euler(360, 360, 0);
            this.render_content(host, response.content.side_3.url, 'side3', new Transform({
                position: new Vector3(1.83, 4.15, 1.79),
                rotation: this.rotation,
                scale: new Vector3(3.2, 2.5, 2)
            }), response.content.side_3.type);

            this.rotation = response.content.side_4.type == 'image' ? Quaternion.Euler(180, 180, 0) : Quaternion.Euler(360, 180, 0);
            this.render_content(host, response.content.side_4.url, 'side4', new Transform({
                position: new Vector3(1.83, 4.15, -1.53),
                rotation: this.rotation,
                scale: new Vector3(3.2, 2.5, 2)
            }), response.content.side_4.type);

        } catch (e) {
            log('failed to reach URL', e)
        }

    }

    getSceneId(land: ILand): string {
        return 'scene-' +
            land.sceneJsonData.scene.base.replace(new RegExp('-', 'g'), 'n')
                .replace(',', '-')
    }
}