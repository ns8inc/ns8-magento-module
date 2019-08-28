import { expect } from 'chai';
import { IDraftOrderNoteAttribute, IOrderClientDetails } from 'shopify-api-node';
import { parseDemoNoteAttributes } from '../../src';

describe('parseDemoSession', () => {
  const clientDetailsKeys = [
    'accept_language',
    'browser_height',
    'browser_ip',
    'browser_width',
    'session_hash',
    'user_agent',
  ];

  it('should map note_attributes into a client_info object', () => {
    const noteAttributes: IDraftOrderNoteAttribute[] = [
      {
        name: 'userId',
        value: '51999845398839',
      },
      {
        name: 'ip',
        value: '66.249.69.193',
      },
      {
        name: 'ua',
        value: 'Mozilla\/5.0 (Macintosh; Intel Mac OS X) AppleWebKit\/534.34 ' +
          '(KHTML, like Gecko)PhantomJS\/1.9.0(development) Safari\/534.34',
      },
      {
        name: 'accept_language',
        value: 'en-us',
      },
    ];

    const clientDetails: IOrderClientDetails | Error = parseDemoNoteAttributes(noteAttributes);

    expect(clientDetails).to.have.all.keys(clientDetailsKeys);
    expect(clientDetails.browser_ip).to.equal('66.249.69.193');
    expect(clientDetails.user_agent).to.equal('Mozilla\/5.0 (Macintosh; Intel Mac OS X) AppleWebKit\/534.34 ' +
      '(KHTML, like Gecko)PhantomJS\/1.9.0(development) Safari\/534.34');
    expect(clientDetails.accept_language).to.equal('en-us');
  });

  it('should create an empty client_info object even if there are no note_attributes', () => {
    const noteAttributes: IDraftOrderNoteAttribute[] = [];

    const clientDetails: IOrderClientDetails | Error = parseDemoNoteAttributes(noteAttributes);

    expect(clientDetails).to.have.all.keys(clientDetailsKeys);
    expect(clientDetails.browser_ip).to.be.empty;
    expect(clientDetails.user_agent).to.be.empty;
    expect(clientDetails.accept_language).to.be.empty;
  });

  it('should create an empty client_info object even if note_attributes param is undefined', () => {
    const clientDetails: IOrderClientDetails | Error = parseDemoNoteAttributes(undefined);

    expect(clientDetails).to.have.all.keys(clientDetailsKeys);
    expect(clientDetails.browser_ip).to.be.empty;
    expect(clientDetails.user_agent).to.be.empty;
    expect(clientDetails.accept_language).to.be.empty;
  });
});
