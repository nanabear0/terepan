import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ArtistList } from '../artist-list/artist-list';
import { Artist } from '../music-brainz/artist';
import { FollowedArtistsStore } from '../stores/followed-artists-store';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
// const anan = `{"0246a3fd-a254-416d-8cd2-e31da4ac6f59":{"id":"0246a3fd-a254-416d-8cd2-e31da4ac6f59","score":100,"name":"Haken","area":"United Kingdom","begin":"2007-01-01T00:00:00.000Z"},"05517f7b-af80-4abf-9de8-5a69d0b7b013":{"id":"05517f7b-af80-4abf-9de8-5a69d0b7b013","score":100,"name":"The Omnific","area":"Australia"},"055b6082-b9cc-4688-85c4-8153c0ef2d70":{"id":"055b6082-b9cc-4688-85c4-8153c0ef2d70","score":100,"name":"Crippled Black Phoenix","area":"United Kingdom","begin":"2004-01-01T00:00:00.000Z"},"0a6f98fb-4134-4e0b-bfc2-d9f1e59a8ee6":{"id":"0a6f98fb-4134-4e0b-bfc2-d9f1e59a8ee6","score":100,"name":"Bent Knee","area":"Boston","begin":"2009-01-01T00:00:00.000Z"},"0cf0af1f-20ca-4863-9b24-5f52772f7715":{"id":"0cf0af1f-20ca-4863-9b24-5f52772f7715","score":100,"name":"Anekdoten","area":"Sweden","begin":"1991-01-01T00:00:00.000Z"},"12d23614-76e9-4ce4-a0a6-e6bab3909cde":{"id":"12d23614-76e9-4ce4-a0a6-e6bab3909cde","score":100,"name":"Yuri Gagarin","area":"Sweden","begin":"2012-01-01T00:00:00.000Z"},"1477ba9c-7b62-4c38-b8e0-aea0cc304e7e":{"id":"1477ba9c-7b62-4c38-b8e0-aea0cc304e7e","score":100,"name":"Native Construct","area":"Boston","begin":"2011-01-01T00:00:00.000Z"},"14898464-781d-4ae5-ada1-7aab9d3926eb":{"id":"14898464-781d-4ae5-ada1-7aab9d3926eb","score":100,"name":"The Great Discord","area":"Linköping","begin":"2014-01-01T00:00:00.000Z"},"169c4c28-858e-497b-81a4-8bc15e0026ea":{"id":"169c4c28-858e-497b-81a4-8bc15e0026ea","score":100,"name":"Porcupine Tree","area":"United Kingdom","begin":"1987-01-01T00:00:00.000Z"},"182430af-bc1c-4028-b2c8-37d77e0df225":{"id":"182430af-bc1c-4028-b2c8-37d77e0df225","score":100,"name":"KAUAN","area":"Helsinki","begin":"2005-02-03T00:00:00.000Z"},"1870fb43-50f1-4660-a879-bb596d1519b6":{"id":"1870fb43-50f1-4660-a879-bb596d1519b6","score":100,"name":"Between the Buried and Me","area":"United States","begin":"2000-01-01T00:00:00.000Z"},"1c5efd53-d6b6-4d63-9d22-a15025cf5f07":{"id":"1c5efd53-d6b6-4d63-9d22-a15025cf5f07","score":100,"name":"Gojira","area":"France","begin":"1996-01-01T00:00:00.000Z"},"1efff932-5b23-4c92-9d0b-0105886bb0fb":{"id":"1efff932-5b23-4c92-9d0b-0105886bb0fb","score":100,"name":"Unreqvited","area":"Canada","begin":"2016-10-29T00:00:00.000Z"},"1f5ff245-2837-4d4a-a609-e93e544478c3":{"id":"1f5ff245-2837-4d4a-a609-e93e544478c3","score":100,"name":"Trivium","area":"United States","begin":"2000-01-01T00:00:00.000Z"},"26f28e9b-c0db-44d1-84ca-817f8cf5d249":{"id":"26f28e9b-c0db-44d1-84ca-817f8cf5d249","score":94,"name":"A.A. Williams","area":"London"},"2c560b38-d7a9-4b2a-9ee3-e183b9549248":{"id":"2c560b38-d7a9-4b2a-9ee3-e183b9549248","score":100,"name":"White Ward","area":"Ukraine","begin":"2012-01-01T00:00:00.000Z"},"2f911bc5-8619-40c9-ae9a-9c6250ba5b25":{"id":"2f911bc5-8619-40c9-ae9a-9c6250ba5b25","score":100,"name":"Grails","area":"Portland","begin":"1999-01-01T00:00:00.000Z"},"31745282-b1ea-4d62-939f-226b14d68e7c":{"id":"31745282-b1ea-4d62-939f-226b14d68e7c","score":100,"name":"In Flames","area":"Sweden","begin":"1990-01-01T00:00:00.000Z"},"3648db01-b29d-4ab9-835c-83f6a5068fe4":{"id":"3648db01-b29d-4ab9-835c-83f6a5068fe4","score":100,"name":"Godspeed You! Black Emperor","area":"Canada","begin":"1994-01-01T00:00:00.000Z"},"37913756-d32b-4fc0-8dd0-cdecc6e605bf":{"id":"37913756-d32b-4fc0-8dd0-cdecc6e605bf","score":100,"name":"Thy Catafalque","area":"Hungary","begin":"1998-01-01T00:00:00.000Z"},"37cfb830-9d26-470e-92b8-3ed03d7d5943":{"id":"37cfb830-9d26-470e-92b8-3ed03d7d5943","score":100,"name":"Violet Cold","area":"Bakı","begin":"2013-01-01T00:00:00.000Z"},"3979eee5-c72a-4b0a-9191-a0243881250a":{"id":"3979eee5-c72a-4b0a-9191-a0243881250a","score":100,"name":"Kayo Dot","area":"United States","begin":"2003-01-01T00:00:00.000Z"},"3a51b862-0144-40f6-aa17-6aaeefea29d9":{"id":"3a51b862-0144-40f6-aa17-6aaeefea29d9","score":100,"name":"Steven Wilson","area":"United Kingdom","begin":"1967-11-03T00:00:00.000Z"},"3ab39ae8-599e-4d70-8902-894dcfcf4092":{"id":"3ab39ae8-599e-4d70-8902-894dcfcf4092","score":100,"name":"Caligula’s Horse","area":"Australia","begin":"2011-04-28T00:00:00.000Z"},"3b98b354-00f4-4874-8993-3be9156d7155":{"id":"3b98b354-00f4-4874-8993-3be9156d7155","score":88,"name":"An Autumn","area":"Netherlands","begin":"2008-01-01T00:00:00.000Z"},"3dbcce07-b2c9-407f-a1a0-4e191a2b786d":{"id":"3dbcce07-b2c9-407f-a1a0-4e191a2b786d","score":100,"name":"Rendezvous Point","area":"Norway","begin":"2010-01-01T00:00:00.000Z"},"3f6c0aa1-a7a9-4ff2-9c50-e84d4b0de178":{"id":"3f6c0aa1-a7a9-4ff2-9c50-e84d4b0de178","score":100,"name":"Plini","area":"Australia","begin":"1992-01-01T00:00:00.000Z"},"3ffe2c2b-6ec6-4290-af05-7e35b75264a7":{"id":"3ffe2c2b-6ec6-4290-af05-7e35b75264a7","score":100,"name":"Les Discrets","area":"France","begin":"2003-01-01T00:00:00.000Z"},"466f7b0a-a3e6-435d-8326-b4ef825a609d":{"id":"466f7b0a-a3e6-435d-8326-b4ef825a609d","score":100,"name":"乃木坂46","area":"Japan","begin":"2011-06-29T00:00:00.000Z"},"46b3c6d3-97a8-4f81-88d4-15585f4ff350":{"id":"46b3c6d3-97a8-4f81-88d4-15585f4ff350","score":100,"name":"Ions","area":"Praha","begin":"2016-01-01T00:00:00.000Z"},"470bc8ca-9dda-4045-b1a1-18b79a50c35f":{"id":"470bc8ca-9dda-4045-b1a1-18b79a50c35f","name":"Arcane","area":"Australia","begin":"2004-01-01T00:00:00.000Z","end":"2015-12-20T00:00:00.000Z"},"514207ca-6f2d-4736-975a-0cbc2349958e":{"id":"514207ca-6f2d-4736-975a-0cbc2349958e","score":100,"name":"If These Trees Could Talk","area":"United States","begin":"2000-01-01T00:00:00.000Z"},"5153eb0e-b6dd-4882-a24a-7d464c153962":{"id":"5153eb0e-b6dd-4882-a24a-7d464c153962","score":100,"name":"Red Sparowes","area":"United States","begin":"2003-01-01T00:00:00.000Z"},"5706c580-e2c4-4763-8709-acd570de258e":{"id":"5706c580-e2c4-4763-8709-acd570de258e","score":100,"name":"Gazpacho","area":"Norway","begin":"1996-01-01T00:00:00.000Z"},"5854a6de-af8f-4b99-8710-cb47d6436a19":{"id":"5854a6de-af8f-4b99-8710-cb47d6436a19","score":100,"name":"iamthemorning","area":"Russia","begin":"2010-10-15T00:00:00.000Z"},"5b129d0f-a967-4920-8a57-2c02e1f4a6f2":{"id":"5b129d0f-a967-4920-8a57-2c02e1f4a6f2","score":100,"name":"White Moth Black Butterfly","begin":"2013-01-01T00:00:00.000Z"},"5b8f62d4-f0f2-4cd7-8106-4518dbd188db":{"id":"5b8f62d4-f0f2-4cd7-8106-4518dbd188db","score":100,"name":"Frost*","area":"United Kingdom","begin":"2004-01-01T00:00:00.000Z"},"5c2d2520-950b-4c78-84fc-78a9328172a3":{"id":"5c2d2520-950b-4c78-84fc-78a9328172a3","score":100,"name":"Animals as Leaders","area":"United States","begin":"2007-01-01T00:00:00.000Z"},"5e43a2e0-9631-4ba8-a33e-f5e6d6596c9b":{"id":"5e43a2e0-9631-4ba8-a33e-f5e6d6596c9b","score":100,"name":"Barren Earth","area":"Finland","begin":"2007-01-01T00:00:00.000Z"},"5f976464-4a48-4c0e-aee4-bb70afaf7a8b":{"id":"5f976464-4a48-4c0e-aee4-bb70afaf7a8b","score":100,"name":"Sólstafir","area":"Iceland","begin":"1995-01-01T00:00:00.000Z"},"61ed9c9c-79eb-4e8f-8015-bd599ac0ab49":{"id":"61ed9c9c-79eb-4e8f-8015-bd599ac0ab49","score":100,"name":"Katatonia","area":"Sweden","begin":"1991-01-01T00:00:00.000Z"},"65f58749-a46b-412c-8a2c-b22ad3bb9242":{"id":"65f58749-a46b-412c-8a2c-b22ad3bb9242","score":100,"name":"Her Name Is Calla","area":"England","begin":"2004-01-01T00:00:00.000Z","end":"2019-01-01T00:00:00.000Z"},"66d4b54b-77f1-4310-a45c-60972fb47ecc":{"id":"66d4b54b-77f1-4310-a45c-60972fb47ecc","score":100,"name":"Myrkur","area":"Denmark","begin":"1985-01-06T00:00:00.000Z"},"66fc5bf8-daa4-4241-b378-9bc9077939d2":{"id":"66fc5bf8-daa4-4241-b378-9bc9077939d2","score":100,"name":"Tool","area":"United States","begin":"1990-01-01T00:00:00.000Z"},"67349203-0c02-48d9-a0ac-4ff40bac0905":{"id":"67349203-0c02-48d9-a0ac-4ff40bac0905","score":100,"name":"Disillusion","area":"Germany","begin":"1994-01-01T00:00:00.000Z"},"6f274512-701a-43b1-b533-7833af213ba0":{"id":"6f274512-701a-43b1-b533-7833af213ba0","score":100,"name":"Sylvaine","area":"Norway","begin":"1991-01-01T00:00:00.000Z"},"71bfbba5-0de1-41eb-8b21-5849e0f054a7":{"id":"71bfbba5-0de1-41eb-8b21-5849e0f054a7","score":100,"name":"Aquilus","area":"Australia","begin":"2004-01-01T00:00:00.000Z"},"75359245-49cf-4991-932f-e078408481f2":{"id":"75359245-49cf-4991-932f-e078408481f2","score":100,"name":"Ne Obliviscaris","area":"Australia","begin":"2003-01-01T00:00:00.000Z"},"7a42f70d-7c01-46d2-bd88-738967a631f0":{"id":"7a42f70d-7c01-46d2-bd88-738967a631f0","score":100,"name":"Soen","area":"Stockholm","begin":"2004-01-01T00:00:00.000Z"},"7d093650-89be-4108-842b-ba7f5367504b":{"id":"7d093650-89be-4108-842b-ba7f5367504b","score":100,"name":"Nevermore","area":"United States","begin":"1991-01-01T00:00:00.000Z"},"7d209631-ccb8-4a87-8516-64abe4c22dba":{"id":"7d209631-ccb8-4a87-8516-64abe4c22dba","score":100,"name":"Ulver","area":"Norway","begin":"1992-01-01T00:00:00.000Z"},"7e916aa1-a00c-42e5-968d-a6f243206433":{"id":"7e916aa1-a00c-42e5-968d-a6f243206433","score":100,"name":"Sleepytime Gorilla Museum","area":"United States","begin":"1999-01-01T00:00:00.000Z","end":"2011-01-01T00:00:00.000Z"},"82f516a2-fb63-4612-a3d5-a328d68678de":{"id":"82f516a2-fb63-4612-a3d5-a328d68678de","score":100,"name":"Children of Nova","area":"United States","begin":"2007-01-01T00:00:00.000Z"},"841c76d3-b83d-4eb2-b72b-b640c125ab22":{"id":"841c76d3-b83d-4eb2-b72b-b640c125ab22","score":100,"name":"Intervals","area":"Canada","begin":"2011-01-01T00:00:00.000Z"},"8d0acf0e-c099-49ac-b4b3-d57ca9eb2561":{"id":"8d0acf0e-c099-49ac-b4b3-d57ca9eb2561","score":100,"name":"The Ocean","area":"Germany","begin":"2000-01-01T00:00:00.000Z"},"96508e61-1854-436c-8130-e794a724e5e9":{"id":"96508e61-1854-436c-8130-e794a724e5e9","score":100,"name":"Agent Fresco","area":"Iceland","begin":"2008-01-01T00:00:00.000Z"},"96a4e481-b025-4726-a3f8-c9859f9e5281":{"id":"96a4e481-b025-4726-a3f8-c9859f9e5281","score":100,"name":"Wilderun","area":"United States","begin":"2008-01-01T00:00:00.000Z"},"96c44b6a-216d-48f1-9c2d-2be773a5779e":{"id":"96c44b6a-216d-48f1-9c2d-2be773a5779e","score":97,"name":"Arch Echo","area":"Nashville","begin":"2016-01-01T00:00:00.000Z"},"985c5cc9-2dc1-49ac-8806-5b66586a2d58":{"id":"985c5cc9-2dc1-49ac-8806-5b66586a2d58","score":100,"name":"Riverside","area":"Warsaw","begin":"2001-10-27T00:00:00.000Z"},"9d07f2ed-7bcf-4c60-86cc-0c29654120a0":{"id":"9d07f2ed-7bcf-4c60-86cc-0c29654120a0","score":100,"name":"Rishloo","area":"United States","begin":"2003-01-01T00:00:00.000Z","end":"2012-01-01T00:00:00.000Z"},"a2e55cf5-ca3a-4c26-ba62-fc4a4f2bc603":{"id":"a2e55cf5-ca3a-4c26-ba62-fc4a4f2bc603","score":100,"name":"Leprous","area":"Norway","begin":"2001-01-01T00:00:00.000Z"},"a61d862c-2714-47a7-b68b-2870a753f4a8":{"id":"a61d862c-2714-47a7-b68b-2870a753f4a8","score":100,"name":"Night Verses","area":"United States","begin":"2012-01-02T00:00:00.000Z"},"a630b133-bcc4-4796-9a0e-685c68b1e6ab":{"id":"a630b133-bcc4-4796-9a0e-685c68b1e6ab","score":100,"name":"The Contortionist","area":"United States","begin":"2007-01-01T00:00:00.000Z"},"a67ddc49-d1e8-4691-af6c-2407c8e59fcb":{"id":"a67ddc49-d1e8-4691-af6c-2407c8e59fcb","score":100,"name":"Karma Rassa","area":"Sankt-Peterburg"},"a7ee612d-1f9b-4446-8765-9d178ead346c":{"id":"a7ee612d-1f9b-4446-8765-9d178ead346c","score":100,"name":"Hexvessel","area":"Finland","begin":"2009-01-01T00:00:00.000Z"},"af723a8a-d3db-46c2-82a3-201dde8fa27f":{"id":"af723a8a-d3db-46c2-82a3-201dde8fa27f","score":100,"name":"Diablo Swing Orchestra","area":"Sweden","begin":"2003-01-01T00:00:00.000Z"},"b1dc9efe-dd1c-43fc-8538-442c96a18203":{"id":"b1dc9efe-dd1c-43fc-8538-442c96a18203","score":100,"name":"Venus Principle","area":"Sweden"},"b9a20306-a4f5-4d3c-8680-e9cdc7e3af5b":{"id":"b9a20306-a4f5-4d3c-8680-e9cdc7e3af5b","score":100,"name":"Scar Symmetry","area":"Sweden","begin":"2004-04-01T00:00:00.000Z"},"bb0fa8bd-c230-49b1-bc80-e69e229d158f":{"id":"bb0fa8bd-c230-49b1-bc80-e69e229d158f","score":100,"name":"Thank You Scientist","area":"United States","begin":"2009-01-01T00:00:00.000Z"},"c14b4180-dc87-481e-b17a-64e4150f90f6":{"id":"c14b4180-dc87-481e-b17a-64e4150f90f6","score":100,"name":"Opeth","area":"Sweden","begin":"1990-01-01T00:00:00.000Z"},"c9b3b5db-a116-48a1-9874-2915e44a437c":{"id":"c9b3b5db-a116-48a1-9874-2915e44a437c","score":100,"name":"Omnerod","area":"Belgium","begin":"2009-01-01T00:00:00.000Z"},"ca5d868f-67b6-42ff-ac16-3c3303130530":{"id":"ca5d868f-67b6-42ff-ac16-3c3303130530","score":100,"name":"Life on Venus","area":"Russia"},"cca40a67-e959-46f8-a3f3-8a3f77d2da9e":{"id":"cca40a67-e959-46f8-a3f3-8a3f77d2da9e","score":100,"name":"Russian Circles","area":"United States","begin":"2004-01-01T00:00:00.000Z"},"d0471ad5-6591-477c-8790-efdce698d3b6":{"id":"d0471ad5-6591-477c-8790-efdce698d3b6","score":100,"name":"Ihsahn","area":"Norway","begin":"1975-10-10T00:00:00.000Z"},"dd77b8da-cdc7-46b8-8a7f-10894ca0490e":{"id":"dd77b8da-cdc7-46b8-8a7f-10894ca0490e","score":100,"name":"Alcest","area":"France","begin":"2000-01-01T00:00:00.000Z"},"e05e4aff-e1e1-42e3-a085-5d826821c92c":{"id":"e05e4aff-e1e1-42e3-a085-5d826821c92c","score":100,"name":"Slice the Cake","begin":"2009-01-01T00:00:00.000Z"},"e18ea224-f801-4059-a585-65ce40ca0d4f":{"id":"e18ea224-f801-4059-a585-65ce40ca0d4f","score":100,"name":"Kingcrow","area":"Italy","begin":"1996-01-01T00:00:00.000Z"},"e5f068d1-01c3-435e-b7aa-a33c83e72560":{"id":"e5f068d1-01c3-435e-b7aa-a33c83e72560","score":92,"name":"In the Silence","area":"United States","begin":"2009-01-01T00:00:00.000Z"},"e8eac778-1b83-421b-9fe9-3d419d536d85":{"id":"e8eac778-1b83-421b-9fe9-3d419d536d85","score":100,"name":"The Reticent","begin":"2006-01-01T00:00:00.000Z"},"e8f55abb-a6d5-4e5f-81b4-14f9cc320519":{"id":"e8f55abb-a6d5-4e5f-81b4-14f9cc320519","score":100,"name":"The Pineapple Thief","area":"United Kingdom","begin":"1999-01-01T00:00:00.000Z"},"efaefde1-e09b-4d49-9d8e-b1304d2ece8d":{"id":"efaefde1-e09b-4d49-9d8e-b1304d2ece8d","score":100,"name":"Amorphis","area":"Finland","begin":"1990-01-01T00:00:00.000Z"},"f1ec4765-e5da-4591-8b50-a8ff9627dda8":{"id":"f1ec4765-e5da-4591-8b50-a8ff9627dda8","score":100,"name":"TesseracT","area":"United Kingdom","begin":"2003-05-01T00:00:00.000Z"},"f44c8d1b-1465-4060-ac46-9994725b1c78":{"id":"f44c8d1b-1465-4060-ac46-9994725b1c78","score":100,"name":"Ancestors","area":"United States","begin":"2006-01-01T00:00:00.000Z"},"f7c65346-9631-4220-9188-5e90baae58d5":{"id":"f7c65346-9631-4220-9188-5e90baae58d5","score":99,"name":"Pain of Salvation","area":"Sweden","begin":"1991-01-01T00:00:00.000Z"},"fd529c0d-4a5c-479d-bbb8-601cefe2b38b":{"id":"fd529c0d-4a5c-479d-bbb8-601cefe2b38b","score":100,"name":"VOLA","area":"Denmark","begin":"2006-01-01T00:00:00.000Z"},"ff230c4c-9557-4576-b652-2263c51a48b1":{"id":"ff230c4c-9557-4576-b652-2263c51a48b1","score":100,"name":"Distorted Harmony","area":"Israel","begin":"2011-01-01T00:00:00.000Z"}}`;

@Component({
  selector: 'app-import',
  imports: [
    FormsModule,
    TextareaModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    CardModule,
    ButtonModule,
    FieldsetModule,
    ArtistList,
    MessageModule,
    FileUploadModule,
  ],
  templateUrl: './import.html',
  styleUrl: './import.scss',
  providers: [MessageService],
})
export class Import {
  importForm = new FormGroup({ input: new FormControl<string>('') }, (o) =>
    !o.value.input ? { input: 'required' } : null
  );
  followedArtistsStore = inject(FollowedArtistsStore);
  parsedArtists = signal<Map<string, Artist> | null>(null);
  parsedArtistsAsList = computed(() => {
    const artistsToBeImported: Artist[] = [];
    const parsedArtists = this.parsedArtists();
    for (const artistId of parsedArtists?.keys() ?? []) {
      if (!this.followedArtistsStore.contains(artistId)) {
        artistsToBeImported.push(parsedArtists!.get(artistId)!);
      }
    }
    return artistsToBeImported;
  });
  messageService = inject(MessageService);

  allArtistsAlreadyAdded = computed(
    () => !!this.parsedArtists()?.size && !this.parsedArtistsAsList().length
  );

  async validate() {
    const json = this.importForm.value.input ?? '';
    const newArtists = await this.followedArtistsStore.parseArtistMap(json);
    if (!newArtists) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation error!',
        detail: 'Invalid JSON',
      });
    }
    this.parsedArtists.set(new Map(newArtists));
  }

  import() {
    const parsedArtists = this.parsedArtists();
    if (parsedArtists?.size) {
      this.followedArtistsStore.importArtists(parsedArtists);
      this.parsedArtists.set(null);
      this.importForm.controls.input.setValue('');
      this.messageService.add({
        severity: 'success',
        summary: 'Import successful!',
        detail: `${parsedArtists.size} artists added/updated`,
      });
    }
  }

  onUpload({ files }: FileSelectEvent) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        this.importForm.controls.input.setValue(reader.result.toString());
      }
    };
    reader.readAsText(file);
  }
}
