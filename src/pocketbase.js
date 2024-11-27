import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://autoinvoicesample.pockethost.io/');
pb.autoCancellation(false); 